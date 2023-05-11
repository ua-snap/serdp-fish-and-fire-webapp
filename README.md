# SERDP Fish and Fire web app

## Setup

### Convert CSV files to JSON

Data for this project was provided in CSV format. This repo includes a preprocessing script to convert the CSV files into JSON files. This is necessary to:

- Build the many-to-one relationships of CSV rows into a JSON tree structure
- Compute means when an AOI has multiple RCAs, each with their own set of values
- Omit blank and infinite values
- Optimize data by removing unused fields and rounding to sensible digits

To generate the needed JSON files, download the five CSV data files from [Google Drive](https://drive.google.com/drive/folders/1hBjKEYzRPY7qQlbnqyMaYRMZSuMtIABB?usp=sharing) and store them in `scripts/input`. Then run the following commands to convert them to JSON:

```
cd scripts
pipenv install
./convert.sh
```

The JSON files will appear in the `assets` subdirectory of this repo, where they will be imported by the Pinia store.

### Generate AOI boundary and shadowmask

The map component of this webapp uses a boundary GeoJSON file to determine the clickable area and adjust the mouse cursor accordingly. A shadow mask of the boundary is also loaded as a layer into the map make the unclickable areas darker.

To generate both the boundary and shadowmask files, first download the AOI shapefile (ZIP) from [Google Drive](https://drive.google.com/drive/folders/1hBjKEYzRPY7qQlbnqyMaYRMZSuMtIABB?usp=sharing) and extract it into the `scripts/input` directory.

#### Generate the boundary GeoJSON file

```
cd scripts
pipenv install
./boundary.py
```

The boundary GeoJSON file will appear in `assets/boundary.geojson`.

#### Generate the boundary shadow mask Shapefile

Clone the [geospatial-vector-veracity](https://github.com/ua-snap/geospatial-vector-veracity) repo, then run:

```
cd geospatial-vector-veracity/utilities
pipenv install
pipenv run python symmetric_difference.py ../serdp-fish-and-fire/scripts/input/AOI_v2_1.shp \
--bounds -180 -90 180 90 'SERDP Fish and Fire AOI shadow mask' 'AOI_v2_1_shadowmask' \
AOI_v2_1_shadowmask.shp preview.png
```

The `AOI_v2_1_shadowmask` shapefile then needs to be uploaded to our GeoServer and added as a store and layer.

### Run the app

```
nvm use lts/hydrogen
npm install
npm run dev
```

### Build and upload the app to S3

```
nvm use lts/hydrogen
npm run build
aws s3 cp .output/public s3://fish-and-fire-test/ --acl public-read --recursive
```
