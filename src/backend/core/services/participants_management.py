"""Participants management service for LiveKit rooms."""

# pylint: disable=too-many-arguments,no-name-in-module,too-many-positional-arguments
# ruff: noqa:PLR0913

import json
import uuid
from logging import getLogger
from typing import Dict, Optional

from asgiref.sync import async_to_sync
from livekit.api import (
    MuteRoomTrackRequest,
    RoomParticipantIdentity,
    TwirpError,
    UpdateParticipantRequest,
)

from core import utils

from .lobby import LobbyService

logger = getLogger(__name__)


class ParticipantsManagementException(Exception):
    """Exception raised when a participant management operation fails.

    We attach an HTTP-ish status_code so API layer can translate common LiveKit
    errors into meaningful responses (e.g. participant not found).
    """

    def __init__(self, message: str, *, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code


class ParticipantsManagement:
    """Service for managing participants."""

    @async_to_sync
    async def mute(self, room_name: str, identity: str, track_sid: str):
        """Mute a specific audio or video track for a participant in a room."""
        request = MuteRoomTrackRequest(
            room=room_name,
            identity=identity,
            track_sid=track_sid,
            muted=True,
        )

        async def operation(lkapi):
            await lkapi.room.mute_published_track(request)

        await self._execute_livekit_participant_operation(
            operation,
            error_message="Could not mute participant",
        )

    @async_to_sync
    async def remove(self, room_name: str, identity: str):
        """Remove a participant from a room and clear their lobby cache.

        LiveKit returns a TwirpError with status 404 when the participant/room is
        not found. We propagate this as a ParticipantsManagementException with
        status_code=404 so the API can return HTTP 404 instead of 500.
        """
        # Best-effort lobby cache cleanup (do not fail removal if room_name isn't a UUID)
        try:
            LobbyService().clear_participant_cache(
                room_id=uuid.UUID(room_name),
                participant_id=identity,
            )
        except (ValueError, TypeError) as exc:
            logger.warning(
                "participants_management.remove: room_name '%s' is not a UUID; "
                "skipping lobby cache clear",
                room_name,
                exc_info=exc,
            )

        request = RoomParticipantIdentity(room=room_name, identity=identity)

        async def operation(lkapi):
            await lkapi.room.remove_participant(request)

        await self._execute_livekit_participant_operation(
            operation,
            error_message="Could not remove participant",
        )

    @async_to_sync
    async def update(
        self,
        room_name: str,
        identity: str,
        metadata: Optional[Dict] = None,
        attributes: Optional[Dict] = None,
        permission: Optional[Dict] = None,
        name: Optional[str] = None,
    ):
        """Update participant properties such as metadata, attributes, permissions, or name."""
        request = UpdateParticipantRequest(
            room=room_name,
            identity=identity,
            metadata=json.dumps(metadata),
            permission=permission,
            attributes=attributes,
            name=name,
        )

        async def operation(lkapi):
            await lkapi.room.update_participant(request)

        await self._execute_livekit_participant_operation(
            operation,
            error_message="Could not update participant",
        )

    async def _execute_livekit_participant_operation(
        self,
        operation,
        *,
        error_message: str,
    ):
        """Execute a LiveKit participant operation with shared lifecycle handling."""
        lkapi = utils.create_livekit_client()
        try:
            await operation(lkapi)
        except TwirpError as exc:
            status_code = 404 if getattr(exc, "status", None) == 404 else 500
            raise ParticipantsManagementException(
                error_message,
                status_code=status_code,
            ) from exc
        finally:
            await lkapi.aclose()
