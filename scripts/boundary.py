#!/usr/bin/env python
import geopandas as gpd
from shapely.ops import unary_union

# Read shapefile of all 300+ AOIs.
gdf = gpd.read_file("input/AOI_v2_1.shp")

# Get the boundary (perimeter) of entire set of AOIs.
gdf = gpd.GeoDataFrame(
    gpd.GeoSeries(unary_union(gdf.geometry.values)), columns=["geometry"]
)

# Write boundary as GeoJSON format for use with Leaflet.
gdf.to_file("../assets/boundary.json")
