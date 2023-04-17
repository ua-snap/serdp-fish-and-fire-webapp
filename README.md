# SERDP Fish and Fire web app

## Setup

### Convert CSV files to JSON

Data for this project was provided in CSV format. This repo includes a preprocessing script to convert the CSV files into JSON files. This is necessary to:

- Build the many-to-one relationships of CSV rows into a JSON tree structure
- Compute means when an AOI has multiple RCAs, each with their own set of values
- Omit blank and infinite values
- Optimize data by removing unused fields and rounding to sensible digits

To generate the needed JSON files, download the five CSV data files from [Google Drive](https://drive.google.com/drive/folders/1hrGuRmQtx-gTepN_H9BEfcGmnl5MCeAK?usp=sharing) and store them in `scripts/input`. Then run the following commands to convert them to JSON:

```
cd scripts
pipenv install
./convert.sh
```

The JSON files will appear in the `assets` subdirectory of this repo, where they will be imported by the Pinia store.

### Run the app

```
nvm use lts/hydrogen
npm install
npm run dev
```
