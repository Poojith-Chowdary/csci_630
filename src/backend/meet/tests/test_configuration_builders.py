"""Tests for settings configuration builders."""

from meet.configuration_builders import build_frontend_configuration


def test_frontend_configuration_builder_preserves_expected_keys():
    """Frontend configuration builder should expose the same settings keys."""
    configuration = build_frontend_configuration()

    assert list(configuration) == [
        "custom_css_url",
        "analytics",
        "support",
        "silence_livekit_debug_logs",
        "is_silent_login_enabled",
        "idle_disconnect_warning_delay",
        "feedback",
        "external_home_url",
        "use_french_gov_footer",
        "use_proconnect_button",
        "manifest_link",
        "transcription_destination",
    ]


def test_frontend_configuration_builder_preserves_expected_defaults():
    """Frontend configuration builder should preserve default values."""
    configuration = build_frontend_configuration()

    assert configuration == {
        "custom_css_url": None,
        "analytics": {},
        "support": {},
        "silence_livekit_debug_logs": False,
        "is_silent_login_enabled": True,
        "idle_disconnect_warning_delay": None,
        "feedback": {},
        "external_home_url": None,
        "use_french_gov_footer": False,
        "use_proconnect_button": False,
        "manifest_link": None,
        "transcription_destination": None,
    }
