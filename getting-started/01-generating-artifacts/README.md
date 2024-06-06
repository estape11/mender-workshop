# Use-case: Generating our first Mender artifact

## Goal
Create, upload and deploy our first Mender artifact.

## Setup
- Check that mender-artifact is installed
```
mender-artifact --version
```

- Download and the `single-file-artifact-gen` script tool, it uses `mender-artifact` underneath 

```
curl -O https://raw.githubusercontent.com/mendersoftware/mender/4.0.2/support/modules-artifact-gen/single-file-artifact-gen
chmod +x single-file-artifact-gen
```

- Create a file to place in the `/etc/` folder of the device
```
echo "My first file deployed with Mender" > mender-deployed-file.txt
```

- Set the needed variables and create the artifact
```
MACHINE="qemux86-64"
FILE_NAME="my-first-artifact-v1.mender"
ARTIFACT_NAME="etc-file-placement-1.0"
SOFTWARE_NAME="mender-deployed-file"

./single-file-artifact-gen \
  --device-type $MACHINE \
  --output-path $FILE_NAME \
  --artifact-name $ARTIFACT_NAME \
  --software-name $SOFTWARE_NAME \
  --software-version 1.0 \
  --dest-dir /etc/ \
  mender-deployed-file.txt
```

`--device-type`: specifies the compatible device type.

`--artifact-nam`: specifies the name of the Artifact.

`--software-version` specifies the version string for the rootfs-image.

`--output-path`: specifies the path to the output file.

- Check the just created artifact
```
mender-artifact read $FILE_NAME
```

- Upload the file to Mender

- Search for the device, and create a deployment with the just uploaded artifact

