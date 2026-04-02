{{- define "extra.clusterSecretStore" -}}
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: {{ .name }}-{{ .namespace }}
spec:
  provider:
    webhook:
      url: "http://bitwarden-cli-{{ .namespace }}.{{ .namespace }}.svc.cluster.local:8087/{{ .urlPath }}"
      {{- if .contentType }}
      headers:
        Content-Type: {{ .contentType }}
      {{- end }}
      result:
        {{- if .jsonPath }}
        jsonPath: "{{ .jsonPath }}"
        {{- else }}
        {}
        {{- end }}
{{- end }}
