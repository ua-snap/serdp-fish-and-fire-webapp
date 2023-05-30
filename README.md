# SERDP Fish and Fire web app

## Setup

### Convert CSV files to JSON

Data for this project was provided in CSV format. This repo includes a preprocessing script to convert the CSV files into JSON files. This is necessary to:

- Build the many-to-one relationships of CSV rows into a JSON tree structure
- Compute means when an AOI has multiple RCAs, each with their own set of values
- Omit blank and infinite values
- Optimize data by removing unused fields and rounding to sensible digits

To generate the required JSON files from the CSV data files, run:

```
cd scripts
pipenv install
pipenv run ./csv2json.py
```

The JSON files will appear in the `assets/data` subdirectory of this repo, where they will be imported by the Pinia store.

An `assets/hash_map.json` file will be generated at the same time. This contains the mappings of 6-digit hashes used in permalinks with their corresponding AOI names.

### Generate AOI boundary and shadowmask

The map component of this webapp uses a boundary GeoJSON file to determine the clickable area and adjust the mouse cursor accordingly. A shadow mask of the boundary is also loaded as a layer into the map to make the unclickable areas darker.

#### Generate the boundary GeoJSON file

```
cd scripts
pipenv install
pipenv run ./boundary.py
```

The boundary GeoJSON file will appear in `assets/boundary.json`.

#### Generate the boundary shadow mask shapefile

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
aws s3 cp .output/public s3://fish-and-fire/ --acl public-read --recursive
```
