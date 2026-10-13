# Notification management

## Structure

```text
src/features/notifications/
  application/       Notification use-case orchestration
  domain/            Notification model, channel preferences, repository contract
  infrastructure/    HTTP implementation of the repository contract
  presentation/      Channel metadata consumed by notification settings UI
  index.ts           Public feature API and dependency wiring
```

## Responsibilities and flow

- The mobile app owns notification preferences and the in-app notification feed.
- Email, SMS, and WhatsApp are the channel preferences currently supported by
  the profile API. The backend owns delivery, retries, and provider credentials;
  the mobile app must never send messages directly through those providers.
- Preference changes continue through the authenticated profile update flow
  (`PATCH /users/me`). The channel list and defaults are defined once in the
  feature domain and presented through `presentation/`.
- The in-app feed uses the authenticated notification endpoints
  (`GET /notifications` and `PATCH /notifications/:id/read`).
- Presentation code calls the application service. The service depends on the
  repository contract; infrastructure implements it with the shared API client.
  Keep transport details out of UI and domain code.

## Extension rules

- Add a channel to the domain channel union and defaults only when the backend
  profile contract supports it; then add its presentation metadata.
- Add feed or preference behavior at the application/repository boundary rather
  than making HTTP calls from components.
- Keep channel provider secrets and delivery logic on the server.
- Propagate request failures to the caller; do not substitute empty success
  values or silently swallow API errors.
- Keep the legacy `services/notification.service` export as a compatibility
  bridge while callers migrate to this feature.
