"""Tests for participant management LiveKit operation template."""

from unittest import mock

import pytest

from core.services import participants_management as participants_module
from core.services.participants_management import (
    ParticipantsManagement,
    ParticipantsManagementException,
)


class FakeTwirpError(Exception):
    """Test double for LiveKit TwirpError."""

    def __init__(self, status):
        super().__init__("LiveKit error")
        self.status = status


def _livekit_client():
    """Create a mocked LiveKit client with async room operations."""
    client = mock.Mock()
    client.room.mute_published_track = mock.AsyncMock()
    client.room.remove_participant = mock.AsyncMock()
    client.room.update_participant = mock.AsyncMock()
    client.aclose = mock.AsyncMock()
    return client


def _mock_livekit_client(monkeypatch, client):
    """Mock LiveKit client creation and return the mock factory."""
    create_livekit_client = mock.Mock(return_value=client)
    monkeypatch.setattr(
        participants_module.utils,
        "create_livekit_client",
        create_livekit_client,
    )
    return create_livekit_client


def test_mute_uses_shared_livekit_lifecycle(monkeypatch):
    """Mute should create, use, and close the LiveKit client."""
    client = _livekit_client()
    create_livekit_client = _mock_livekit_client(monkeypatch, client)

    ParticipantsManagement().mute(
        room_name="room-id",
        identity="participant-id",
        track_sid="track-id",
    )

    create_livekit_client.assert_called_once_with()
    client.room.mute_published_track.assert_awaited_once()
    client.aclose.assert_awaited_once()


def test_remove_uses_shared_livekit_lifecycle(monkeypatch):
    """Remove should create, use, and close the LiveKit client."""
    client = _livekit_client()
    create_livekit_client = _mock_livekit_client(monkeypatch, client)

    ParticipantsManagement().remove(
        room_name="not-a-uuid",
        identity="participant-id",
    )

    create_livekit_client.assert_called_once_with()
    client.room.remove_participant.assert_awaited_once()
    client.aclose.assert_awaited_once()


def test_update_uses_shared_livekit_lifecycle(monkeypatch):
    """Update should create, use, and close the LiveKit client."""
    client = _livekit_client()
    create_livekit_client = _mock_livekit_client(monkeypatch, client)

    ParticipantsManagement().update(
        room_name="room-id",
        identity="participant-id",
        metadata={"role": "speaker"},
        attributes={"team": "blue"},
        permission={"can_publish": True},
        name="Jane Doe",
    )

    create_livekit_client.assert_called_once_with()
    client.room.update_participant.assert_awaited_once()
    client.aclose.assert_awaited_once()


def test_livekit_404_error_is_translated_and_client_is_closed(monkeypatch):
    """Shared template should translate LiveKit 404 errors and close the client."""
    client = _livekit_client()
    client.room.mute_published_track.side_effect = FakeTwirpError(status=404)

    monkeypatch.setattr(participants_module, "TwirpError", FakeTwirpError)
    _mock_livekit_client(monkeypatch, client)

    with pytest.raises(ParticipantsManagementException) as exc_info:
        ParticipantsManagement().mute(
            room_name="room-id",
            identity="participant-id",
            track_sid="track-id",
        )

    assert exc_info.value.status_code == 404
    assert str(exc_info.value) == "Could not mute participant"
    client.aclose.assert_awaited_once()


def test_livekit_non_404_error_is_translated_to_500(monkeypatch):
    """Shared template should translate non-404 LiveKit errors to status 500."""
    client = _livekit_client()
    client.room.update_participant.side_effect = FakeTwirpError(status=503)

    monkeypatch.setattr(participants_module, "TwirpError", FakeTwirpError)
    _mock_livekit_client(monkeypatch, client)

    with pytest.raises(ParticipantsManagementException) as exc_info:
        ParticipantsManagement().update(
            room_name="room-id",
            identity="participant-id",
        )

    assert exc_info.value.status_code == 500
    assert str(exc_info.value) == "Could not update participant"
    client.aclose.assert_awaited_once()
