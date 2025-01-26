# CTMS Upload Action

This GitHub Action uploads files to the Cloud Transport Management Service (CTMS) on SAP BTP. Optionally, it imports the created transport request to a specified target node.

## Features
- Upload MTA archives to CTMS.
- Automatically create transport requests.
- Optionally import transport requests to a specified target node.

## Usage

To use this action, create a workflow file in your repository (e.g., `.github/workflows/upload.yml`) with the following content:

```yaml
jobs:
  test-action:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Upload MTA to CTMS
        uses: miyasuta/ctms-upload-action@main
        with:
          mta: <Path to MTA Archive>
          credentials: ${{ secrets.CTMS_CREDENTIALS }}
          nodeName: <Node Name>
          transportDescription: <Description>   
          namedUser: <Upload User Name>
          importTransportRequest: false
```

## Inputs
- `mta`: The file path to the MTA archive.
- `credentials`: The service key of Cloud Transport Management service instance.
- `nodeName`: The name of the target node where the MTA archive will be uploaded.
- `transportDescription`: A description for the transport request.
- `namedUser` (optional): The user name to display in the CTMS UI. If not provided, the authentication user will be shown.
- `importTransportRequest` (optional): If `true`, the transport request will be imported to the specified node.

## Outputs
- `transportId`: 	The ID of the created transport request.
- `actionId`: The ID of the action generated during the import process. Use this to track the import status.

## Notes
- Ensure that the `CTMS_CREDENTIALS` secret is properly configured in your repository settings.
- The MTA archive should be built and ready before running this action.
- Sample workflows can be found in the following repository:
[github-action-ctms](https://github.com/miyasuta/github-action-ctms/blob/main/.github/workflows/deploy.yml)