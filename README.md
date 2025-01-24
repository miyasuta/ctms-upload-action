# CTMS Upload Action

This GitHub Action uploads files to the CTMS (Cloud Transport Management Service).

## Usage

To use this action, create a workflow file in your repository (e.g., `.github/workflows/upload.yml`) with the following content:

```yaml
name: Upload to CTMS

on:
    push:
        branches:
            - main

jobs:
    build:
        # checkout and build MTA archive
        ...
      - name: Upload MTA Archive
        uses: actions/upload-artifact@v4
        with:
          name: mta
          path: ./gen/mta.tar

    upload:
        runs-on: ubuntu-latest
        steps:
        - name: Download MTA Archive
            uses: actions/download-artifact@v4
            with:
            name: mta
            path: ./

        - name: Upload files to CTMS
            uses: miyasuta/ctms-upload-action@main
            with:
                mta: ./mta.tar
                credentials: ${{ secrets.CTMS_CREDENTIALS }}
                nodeName: <Node Name>
                transportDescription: <Description>                
                namedUser: <Upload User Name>
```

## Inputs

- `mta`: The location of mta archive
- `credentials`: The service key of Cloud Transport Management service instance
- `nodeName`: The target node name to upload the mta archive
- `transportDescription`: The name of the transport request
- `namedUser` (optional): User displayed in Cloud Transport Management UI. If not given, the authentication user will be shown in Cloud Transport Management UI.