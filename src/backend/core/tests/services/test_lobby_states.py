"""Tests for lobby participant state objects."""

from dataclasses import dataclass
from unittest import mock
from uuid import uuid4

from django.conf import settings

import pytest

from core.services import lobby as lobby_module
from core.services.lobby import (
    LobbyParticipant,
    LobbyParticipantStatus,
    LobbyService,
)
from core.services.lobby_states import LobbyParticipantDecisionStateFactory


@dataclass
class Participant:
    """Small test double for a lobby participant."""

    status: LobbyParticipantStatus


def test_lobby_decision_factory_returns_accepted_state():
    """Allowed entry should create an accepted lobby state."""
    state = LobbyParticipantDecisionStateFactory(
        accepted_status=LobbyParticipantStatus.ACCEPTED,
        denied_status=LobbyParticipantStatus.DENIED,
    ).from_decision(True)

    participant = Participant(status=LobbyParticipantStatus.WAITING)

    updated_participant = state.apply_to(participant)

    assert updated_participant.status == LobbyParticipantStatus.ACCEPTED
    assert state.cache_timeout() == settings.LOBBY_ACCEPTED_TIMEOUT


def test_lobby_decision_factory_returns_denied_state():
    """Denied entry should create a denied lobby state."""
    state = LobbyParticipantDecisionStateFactory(
        accepted_status=LobbyParticipantStatus.ACCEPTED,
        denied_status=LobbyParticipantStatus.DENIED,
    ).from_decision(False)

    participant = Participant(status=LobbyParticipantStatus.WAITING)

    updated_participant = state.apply_to(participant)

    assert updated_participant.status == LobbyParticipantStatus.DENIED
    assert state.cache_timeout() == settings.LOBBY_DENIED_TIMEOUT


@pytest.mark.parametrize(
    ("allow_entry", "expected_status", "expected_timeout"),
    [
        (True, LobbyParticipantStatus.ACCEPTED, "accepted-timeout"),
        (False, LobbyParticipantStatus.DENIED, "denied-timeout"),
    ],
)
def test_handle_participant_entry_applies_decision_state(
    allow_entry,
    expected_status,
    expected_timeout,
    settings,
):
    """Entry decisions should update status and use state-owned timeouts."""
    settings.LOBBY_ACCEPTED_TIMEOUT = "accepted-timeout"
    settings.LOBBY_DENIED_TIMEOUT = "denied-timeout"

    room_id = uuid4()
    participant_id = "participant-id"
    service = LobbyService()
    cache_key = service._get_cache_key(room_id, participant_id)

    participant = LobbyParticipant(
        status=LobbyParticipantStatus.WAITING,
        username="Jane",
        id=participant_id,
        color="#123456",
    )

    with (
        mock.patch.object(lobby_module.cache, "get") as cache_get,
        mock.patch.object(lobby_module.cache, "set") as cache_set,
    ):
        cache_get.return_value = participant.to_dict()

        service.handle_participant_entry(
            room_id=room_id,
            participant_id=participant_id,
            allow_entry=allow_entry,
        )

    cache_set.assert_called_once()
    assert cache_set.call_args.args[0] == cache_key
    assert cache_set.call_args.args[1]["status"] == expected_status.value
    assert cache_set.call_args.kwargs["timeout"] == expected_timeout
