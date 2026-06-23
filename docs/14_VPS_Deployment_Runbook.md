# Zell-force VPS Deployment Runbook

This runbook deploys Zell-force separately from the existing `/opt/zellence` stack.

## Target Shape

- App root: `/opt/zell-force`
- Public domain: `https://force.zellence.dev`
- Web container: `zellforce-web`
- API container: `zellforce-api`
- Database container: `zellforce-postgres`
- Web local port: `127.0.0.1:3010`
- API local port: `127.0.0.1:4010`
- WhatsApp webhook URL: `https://force.zellence.dev/api/whatsapp/webhook`

## DNS

Create a Cloudflare `A` record:

- Name: `force`
- Target: `72.60.189.39`

Use DNS-only mode until Certbot finishes issuing the certificate. Cloudflare proxy can be enabled later if wanted.

## VPS Files

Clone the repo into:

```bash
mkdir -p /opt/zell-force
git clone https://github.com/abudiomar/zellence-force.git /opt/zell-force
cd /opt/zell-force
```

Do not persist a personal access token in the Git remote URL.

Create the production env file:

```bash
cp deploy/vps.env.example .env
nano .env
```

Set:

```bash
ZELLFORCE_POSTGRES_PASSWORD=<production-db-password>
BETTER_AUTH_SECRET=<generated-secret>
WHATSAPP_ACCESS_TOKEN=<meta-token>
WHATSAPP_PHONE_NUMBER_ID=<test-phone-number-id>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<your-verify-token>
WHATSAPP_APP_SECRET=<meta-app-secret>
```

The Google service account JSON is mounted from the existing VPS secret:

```text
/etc/zellence/secrets/google-sheets-service-account.json
```

The service account email is:

```text
sheet-editor-bot@zellence.iam.gserviceaccount.com
```

The client must share the applicant response Sheet with that service account.

## Build And Start

```bash
cd /opt/zell-force
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d postgres
docker compose -f docker-compose.production.yml up -d api web
```

Check status:

```bash
docker compose -f docker-compose.production.yml ps
docker logs zellforce-api --tail 100
docker logs zellforce-web --tail 100
```

## Bootstrap Owner

The API bootstrap command runs migrations before creating the first owner.

```bash
docker compose -f docker-compose.production.yml run --rm api \
  bun run bootstrap:owner \
  --tenant-slug=mag-events \
  --full-name="abdulla omar" \
  --email=<owner-email> \
  --password='abudi123'
```

`<owner-email>` still needs to be confirmed before the first production bootstrap.

## Nginx

Install the site config:

```bash
cp /opt/zell-force/deploy/nginx/force.zellence.dev.conf /etc/nginx/sites-available/force.zellence.dev
ln -s /etc/nginx/sites-available/force.zellence.dev /etc/nginx/sites-enabled/force.zellence.dev
nginx -t
systemctl reload nginx
```

Issue SSL:

```bash
certbot --nginx -d force.zellence.dev
```

After Certbot finishes, verify:

```bash
curl -I https://force.zellence.dev
curl https://force.zellence.dev/api/health
```

## WhatsApp

In Meta Developers, set:

- Callback URL: `https://force.zellence.dev/api/whatsapp/webhook`
- Verify token: same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Subscribed webhook field: `messages`

For the test number, make sure your phone is added as an allowed recipient in the WhatsApp API setup screen.

## Safety Notes

- Keep this stack separate from `/opt/zellence`.
- Do not edit `/opt/zellence/docker-compose.yml` for this app.
- Do not store GitHub personal access tokens in files, remotes, shell history, or docs.
- Rotate any personal access token that was pasted into chat or terminal history.
- The password `abudi123` is acceptable only for a short-lived proposal demo. Use a stronger password before external client access.
