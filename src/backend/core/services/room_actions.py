"""Facade for room action orchestration."""

from core.services.participants_management import ParticipantsManagement


class RoomParticipantActions:
    """Coordinate participant-management workflows for rooms."""

    def __init__(self, participants_management=None):
        self.participants_management = (
            participants_management or ParticipantsManagement()
        )

    def mute(self, *, room, participant_identity, track_sid):
        """Mute a participant track in a room."""
        self.participants_management.mute(
            room_name=str(room.pk),
            identity=str(participant_identity),
            track_sid=track_sid,
        )

    def update(
        self,
        *,
        room,
        participant_identity,
        metadata=None,
        attributes=None,
        permission=None,
        name=None,
    ):
        """Update participant attributes, permissions, metadata, or display name."""
        self.participants_management.update(
            room_name=str(room.pk),
            identity=str(participant_identity),
            metadata=metadata,
            attributes=attributes,
            permission=permission,
            name=name,
        )

    def remove(self, *, room, participant_identity):
        """Remove a participant from a room."""
        self.participants_management.remove(
            room_name=str(room.pk),
            identity=str(participant_identity),
        )


class RoomActionsFacade:
    """Facade for room action orchestration.

    The API layer should call this facade instead of constructing and coordinating
    lower-level room services directly.
    """

    def __init__(self, participant_actions=None):
        self.participant_actions = participant_actions or RoomParticipantActions()

    def mute_participant(self, *, room, participant_identity, track_sid):
        """Mute a participant track in a room."""
        self.participant_actions.mute(
            room=room,
            participant_identity=participant_identity,
            track_sid=track_sid,
        )

    def update_participant(
        self,
        *,
        room,
        participant_identity,
        metadata=None,
        attributes=None,
        permission=None,
        name=None,
    ):
        """Update participant data in a room."""
        self.participant_actions.update(
            room=room,
            participant_identity=participant_identity,
            metadata=metadata,
            attributes=attributes,
            permission=permission,
            name=name,
        )

    def remove_participant(self, *, room, participant_identity):
        """Remove a participant from a room."""
        self.participant_actions.remove(
            room=room,
            participant_identity=participant_identity,
        )
