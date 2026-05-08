"""Configuration builders for Django settings."""

from configurations import values


class FrontendConfigurationBuilder:
    """Build the frontend configuration exposed by the backend."""

    def __init__(self):
        self._configuration = {}

    def value(self, key, default, environ_name):
        """Add a string or generic frontend configuration value."""
        self._configuration[key] = values.Value(
            default,
            environ_name=environ_name,
            environ_prefix=None,
        )
        return self

    def boolean_value(self, key, default, environ_name):
        """Add a boolean frontend configuration value."""
        self._configuration[key] = values.BooleanValue(
            default,
            environ_name=environ_name,
            environ_prefix=None,
        )
        return self

    def dict_value(self, key, default, environ_name):
        """Add a dictionary frontend configuration value."""
        self._configuration[key] = values.DictValue(
            default,
            environ_name=environ_name,
            environ_prefix=None,
        )
        return self

    def positive_integer_value(self, key, default, environ_name):
        """Add a positive integer frontend configuration value."""
        self._configuration[key] = values.PositiveIntegerValue(
            default,
            environ_name=environ_name,
            environ_prefix=None,
        )
        return self

    def build(self):
        """Return the assembled frontend configuration."""
        return dict(self._configuration)


def build_frontend_configuration():
    """Build the frontend configuration settings."""
    return (
        FrontendConfigurationBuilder()
        .value("custom_css_url", None, "FRONTEND_CUSTOM_CSS_URL")
        .dict_value("analytics", {}, "FRONTEND_ANALYTICS")
        .dict_value("support", {}, "FRONTEND_SUPPORT")
        .boolean_value(
            "silence_livekit_debug_logs",
            False,
            "FRONTEND_SILENCE_LIVEKIT_DEBUG",
        )
        .boolean_value(
            "is_silent_login_enabled",
            True,
            "FRONTEND_IS_SILENT_LOGIN_ENABLED",
        )
        .positive_integer_value(
            "idle_disconnect_warning_delay",
            None,
            "FRONTEND_IDLE_DISCONNECT_WARNING_DELAY",
        )
        .dict_value("feedback", {}, "FRONTEND_FEEDBACK")
        .value("external_home_url", None, "FRONTEND_EXTERNAL_HOME_URL")
        .boolean_value(
            "use_french_gov_footer",
            False,
            "FRONTEND_USE_FRENCH_GOV_FOOTER",
        )
        .boolean_value(
            "use_proconnect_button",
            False,
            "FRONTEND_USE_PROCONNECT_BUTTON",
        )
        .value("manifest_link", None, "FRONTEND_MANIFEST_LINK")
        .value(
            "transcription_destination",
            None,
            "FRONTEND_TRANSCRIPTION_DESTINATION",
        )
        .build()
    )
