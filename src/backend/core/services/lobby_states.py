"""Lobby participant state objects."""

from django.conf import settings


class LobbyParticipantState:
    """Default lobby participant state behavior."""

    status = None
    timeout = None

    def apply_to(self, participant):
        """Apply this state to a lobby participant."""
        participant.status = self.status
        return participant

    def cache_timeout(self):
        """Return the cache timeout for this state."""
        return self.timeout


class AcceptedLobbyParticipantState(LobbyParticipantState):
    """Accepted participant state behavior."""

    def __init__(self, status):
        self.status = status
        self.timeout = settings.LOBBY_ACCEPTED_TIMEOUT


class DeniedLobbyParticipantState(LobbyParticipantState):
    """Denied participant state behavior."""

    def __init__(self, status):
        self.status = status
        self.timeout = settings.LOBBY_DENIED_TIMEOUT


class LobbyParticipantDecisionStateFactory:
    """Create lobby participant states from entry decisions."""

    def __init__(self, *, accepted_status, denied_status):
        self.accepted_status = accepted_status
        self.denied_status = denied_status

    def from_decision(self, allow_entry):
        """Return the state matching an entry decision."""
        if allow_entry:
            return AcceptedLobbyParticipantState(self.accepted_status)

        return DeniedLobbyParticipantState(self.denied_status)
