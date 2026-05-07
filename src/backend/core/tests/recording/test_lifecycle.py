"""Tests for recording lifecycle state objects."""

import pytest

from core.recording.lifecycle import get_recording_lifecycle_state


@pytest.mark.parametrize(
    "status",
    [
        "active",
        "stopped",
    ],
)
def test_recording_lifecycle_state_savable_statuses(status):
    """Active and stopped recordings should be savable."""
    state = get_recording_lifecycle_state(status)

    assert state.is_savable() is True
    assert state.is_saved() is False


@pytest.mark.parametrize(
    "status",
    [
        "saved",
        "notification_succeeded",
    ],
)
def test_recording_lifecycle_state_saved_statuses(status):
    """Saved lifecycle states should be treated as saved."""
    state = get_recording_lifecycle_state(status)

    assert state.is_savable() is False
    assert state.is_saved() is True


@pytest.mark.parametrize(
    "status",
    [
        "initiated",
        "aborted",
        "failed_to_start",
        "failed_to_stop",
        "unknown",
    ],
)
def test_recording_lifecycle_state_default_statuses(status):
    """Other statuses should use default lifecycle behavior."""
    state = get_recording_lifecycle_state(status)

    assert state.is_savable() is False
    assert state.is_saved() is False
