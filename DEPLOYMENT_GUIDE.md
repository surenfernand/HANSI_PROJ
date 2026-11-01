# Meraki Arts: deploy the supplied HANSI_PROJ website

This kit was prepared for the uploaded HANSI_PROJ.zip. It contains a static comparison homepage and five designs, each with six pages. It uses plain HTML, CSS, JavaScript and images. No Node.js, database, environment variables or uploads volume is needed to serve this version. The shopping bag and forms remain browser demos; deployment does not add order processing, payments or message delivery.

## 1. Merge the kit into the existing Cursor project

Copy the CONTENTS of this kit into the existing HANSI_PROJ repository root, beside its root index.html and the five design directories. Include .dockerignore and .github/workflows/docker-publish.yml. Do not put the entire Meraki_Deployment_Kit folder inside the project. Keep your existing .git directory and all website files. No git init is needed.

Expected layout:

- index.html
- assets/
- 01-coral-sky/
- 02-cobalt-peach/
- 03-rose-butter/
- 04-terracotta-sand/
- 05-navy-apricot/
- Dockerfile
- .dockerignore
- .github/workflows/docker-publish.yml
- deploy/nginx.conf
- deploy/check_site.py
- DEPLOYMENT_GUIDE.md

All five designs are intentionally included. Visiting / opens the comparison page. Visiting /04-terracotta-sand/ or /05-navy-apricot/ opens a specific design directly. Making one design the root homepage is a separate content/layout choice.

## 2. Docker Hub

Create a repository named meraki-html. Create a personal access token with permission to read and write that repository. Do not add the token to any project file or paste it into Cursor/chat.

Public repository: anyone can pull the image, which contains the public website files.
Private repository: configure Docker Hub pull authentication on the Coolify deployment server before deploying. See Coolify's current Docker Image guide for registry authentication: https://coolify.io/docs/applications/deployments/docker-image

## 3. GitHub secrets

In the existing GitHub repository: Settings > Secrets and variables > Actions > Repository secrets.

Create BOTH as secrets (the supplied workflow uses secrets, not variables):
- DOCKERHUB_USERNAME: your lowercase Docker Hub username, not your email
- DOCKERHUB_TOKEN: the Docker Hub personal access token

The workflow runs on pushes to main and on Actions > Build and publish Meraki HTML > Run workflow. It uses GitHub-hosted Ubuntu to validate the site, build an amd64 Linux image, run Nginx/HTTP smoke checks and then publish the tested image. Both latest and the full commit SHA are pushed. A failed validation or smoke check stops publication.

## 4. Cursor prompt

Paste the following into Cursor Agent with this existing repository open:

Read DEPLOYMENT_GUIDE.md and inspect the deployment files in this project. Preserve all existing website designs and the existing Git remote. This is a static HTML site; do not add Node.js, React, Payload, PostgreSQL or other backend services. Verify that the Dockerfile includes all five design folders and excludes credentials and Git metadata. Run python deploy/check_site.py (or python3, whichever is available). If Docker is available, build the image and run the smoke check described below; otherwise clearly report that Docker testing will run on GitHub. Review git status and diff. Stage only Dockerfile, .dockerignore, .github/workflows/docker-publish.yml, deploy/nginx.conf, deploy/check_site.py and DEPLOYMENT_GUIDE.md. Commit them with message "Add Docker deployment for Meraki HTML" and push the existing main branch to its existing origin. Do not force-push, reset, discard changes or include unrelated files. Do not request or print tokens. If GitHub authentication is required, let me authenticate through the normal Git/Cursor flow. Do not claim the website is deployed merely because the Git push succeeds; the first Coolify deployment is a separate step.

Optional local Docker verification (requires Docker Desktop running):

```sh
docker build --platform linux/amd64 -t meraki-html:test .
docker run -d --name meraki-html-test -p 127.0.0.1:8088:80 meraki-html:test
docker exec meraki-html-test nginx -t
python deploy/check_site.py --url http://127.0.0.1:8088
docker rm -f meraki-html-test
```

If local port 8088 is already in use, choose another free port and use it in both commands. Only remove the test container you created.

## 5. Check GitHub Actions

Open the repository's Actions tab. Wait for Build and publish Meraki HTML to finish successfully. Confirm that Docker Hub shows meraki-html:latest and meraki-html:<full-commit-SHA>. Docker is not required on the local computer for this GitHub workflow, but remains required on the VPS (already installed by Coolify).

## 6. Coolify

In Projects > MerakiArts > production > Add Resource > Docker Image, select the existing OVHcloud server.

- Name: meraki-html
- Docker Image / Image Name: surenfernando/meraki-html
- Tag: latest (or the full Git commit SHA for a fixed release)
- Ports Exposes: 80
- Ports Mappings: leave empty
- Domains: keep/generate the temporary http://...sslip.io address
- Environment variables: none required
- Persistent storage: none required; static artwork is already in the image
- Database connection: none required

Save, then Deploy. Wait for Running/Healthy. Open the generated application URL, not the Coolify dashboard URL on port 8000. Visit all design homepages and test their page navigation, image enlargement, filters and demo bag. Share the application URL with your friend for review.

The image health endpoint is /healthz. If adding an HTTP health check in Coolify, use port 80 and path /healthz. The existing proxy forwards traffic from ports 80/443 to container port 80. Do not publish another application directly on host port 80.

If the image cannot be found: confirm the workflow succeeded, the image name/tag matches, and private registry pull authentication is configured if applicable. If the image is Running but the URL fails, inspect the app/proxy logs, DNS resolution of the generated hostname, and provider/firewall access to ports 80/443.

## 7. Updates and rollback

Edit in Cursor > commit and push main > wait for GitHub Actions success > Redeploy in Coolify. Image publication alone does not trigger an automatic Coolify deployment in this kit. Redeploy should pull the updated latest tag; confirm the pulled image/deployment logs if an old version appears. Commit-SHA tags are preferable when selecting a precise release: copy the full desired SHA into Coolify's Tag field, save and deploy. For rollback, select a previously published SHA tag and redeploy.

Automatic Coolify webhooks can be added later after configuring HTTPS for the management endpoint. No Coolify tokens or SSH credentials are needed by this initial workflow.

## Validation performed on this kit

All 31 HTML pages and local HTML link/asset references passed the supplied validator against the uploaded project. JavaScript syntax was checked separately. Docker was unavailable in the preparation environment, so image builds, Nginx configuration validation and live container smoke tests could not be run here. The GitHub workflow performs those checks before pushing an image. Nothing has been pushed to GitHub, Docker Hub or your VPS from this preparation session.

## References

https://docs.docker.com/build/ci/github-actions/
https://coolify.io/docs/applications/deployments/docker-image
https://coolify.io/docs/core/networking/domains
