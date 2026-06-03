# Deployment

The hosted app should be isolated from the current `bluemouse.ai` pages.

Recommended host:

```text
twin.bluemouse.ai
```

DNS record:

```text
Type: A
Name: twin
Value: 143.110.165.178
```

## Server Layout

Recommended web root:

```text
/var/www/twinops
```

Recommended Nginx site:

```text
/etc/nginx/sites-available/twin.bluemouse.ai
```

Enable it with:

```bash
sudo ln -s /etc/nginx/sites-available/twin.bluemouse.ai /etc/nginx/sites-enabled/twin.bluemouse.ai
sudo nginx -t
sudo systemctl reload nginx
```

Add TLS after DNS resolves:

```bash
sudo certbot --nginx -d twin.bluemouse.ai
```

## Deploy Static Build

From this project on Windows:

```powershell
.\deploy\deploy-static.ps1 -Server root@143.110.165.178
```

The script builds the app, uploads `dist/`, and extracts it into `/var/www/twinops`.

It does not change existing Bluemouse web roots or Nginx sites.

