"""Recording lifecycle state objects."""


class RecordingLifecycleState:
    """Default recording lifecycle state."""

    def is_savable(self) -> bool:
        """Return whether the recording can be saved from this state."""
        return False

    def is_saved(self) -> bool:
        """Return whether the recording is considered saved in this state."""
        return False


class ActiveRecordingState(RecordingLifecycleState):
    """Lifecycle behavior for active recordings."""

    def is_savable(self) -> bool:
        """Active recordings can be saved."""
        return True


class StoppedRecordingState(RecordingLifecycleState):
    """Lifecycle behavior for stopped recordings."""

    def is_savable(self) -> bool:
        """Stopped recordings can be saved."""
        return True


class SavedRecordingState(RecordingLifecycleState):
    """Lifecycle behavior for saved recordings."""

    def is_saved(self) -> bool:
        """Saved recordings are considered saved."""
        return True


class NotificationSucceededRecordingState(RecordingLifecycleState):
    """Lifecycle behavior for recordings with successful notification."""

    def is_saved(self) -> bool:
        """Notification-succeeded recordings are considered saved."""
        return True


_RECORDING_STATES_BY_STATUS = {
    "active": ActiveRecordingState,
    "stopped": StoppedRecordingState,
    "saved": SavedRecordingState,
    "notification_succeeded": NotificationSucceededRecordingState,
}


def get_recording_lifecycle_state(status):
    """Return the lifecycle state object for a recording status."""
    state_class = _RECORDING_STATES_BY_STATUS.get(
        str(status),
        RecordingLifecycleState,
    )
    return state_class()
