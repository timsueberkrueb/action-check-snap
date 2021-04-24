# Snap Check Action

This is a GitHub action for checking if a published snap package contains outdated Ubuntu packages.
It uses Canonical's [review-tools](https://snapcraft.io/review-tools) to retrieve a list of [USNs](https://ubuntu.com/security/notices)
that affect a given snap package published to a given channel.

## Example

This action can be used to automatically rebuild and publish a snap package
if security updates have been released for bundled Ubuntu packages.

The following snippet runs a nightly check for a package `<snap-name>` on the `beta` channel.
If security updates are available, it rebuilds the package on branch `<git-branch>`
and releases it to the `beta` channel using [snapcore/action-build](https://github.com/snapcore/action-build)
and [snapcore/action-publish](https://github.com/snapcore/action-publish)

```yaml
name: 'Nightly build'
on:
  schedule:
  - cron: '0 2 * * *'

jobs:
  security-updates:
    name: 'Security updates'
    runs-on: 'ubuntu-latest'
    steps:
    - name: Checkout
      uses: actions/checkout@v2
      with:
        ref: <git-branch>
    - name: Check for outdated Ubuntu packages
      id: check
      uses: timsueberkrueb/action-check-snap@master
      with:
        snap: <snap-name>
        channel: beta
    - if: fromJSON(steps.check.outputs.outdated)
      id: build
      name: Build the snap package
      uses: snapcore/action-build@v1
    - if: fromJSON(steps.check.outputs.outdated)
      name: Deploy the snap package
      uses: snapcore/action-publish@v1
      with:
        store_login: ${{ secrets.SNAPCRAFT_LOGIN_DATA }}
        snap: ${{ steps.build.outputs.snap }}
        release: beta
```

## Action inputs

### `snap`

The name of the snap package to analyze. This input is **required**.

### `channel`

The channel of the snap packge to analyze. Default: stable.

## Action outputs

### `outdated`

A boolean indicating whether the snap contains outdated packages.

### `outdated-packages`

A JSON array of strings with the names of the outdated packages.

### `usns-by-package`

A JSON object mapping package names to a JSON array of USNs.

## Licenses

The code in this repository (excluding the folder named [dist](dist)) is licensed under the [MIT license](LICENSE) and is partly based on [snapcore/action-build](https://github.com/snapcore/action-build).

The folder `dist` contains the JavaScript compilation artifacts including bundled dependencies released under the licenses detailed in [dist/licenses.txt](dist/licenses.txt).
