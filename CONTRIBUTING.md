# Contributing

## Commit Signing

All commits must be signed. Configure locally:

```bash
git config commit.gpgsign true
# or for SSH signing:
git config commit.gpgsign true
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
```

Upload your GPG or SSH key to GitHub account settings before contributing.
