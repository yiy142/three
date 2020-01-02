#pip install xmltodict

import xmltodict
import json
import sys

omit = ["road_border_physical", "human_access", "no_parking_zone", "garage_entrance","garage_exit","speed_bump"]
def cpos(a,b,c,d):
    return {
        "x" : float((a["x"] + b["x"] + c["x"] + d["x"])/4),
        "y" : float((a["y"] + b["y"] + c["y"] + d["y"])/4),
        "z" : float((a["z"] + b["z"] + c["z"] + d["z"])/4)
    }

def epos(a,b):
    return {
        "x" : float((a["x"] + b["x"])/2),
        "y" : float((a["y"] + b["y"]/2)),
        "z" : float((a["z"] + b["z"]/2))
    }

doc = {}
with open(sys.argv[1],'r') as fd:
    doc = xmltodict.parse(fd.read())

if "".join(sys.argv[1].split('.')[-1])!= "osm":
    print("Please re-execute with a .osm file")
    sys.exit()

outFileName = "".join(sys.argv[1].split('.osm')[:-1]) + ".json"
if (len(sys.argv) == 3):
    outFileName = sys.argv[2]
print("Converting {} to {}.".format(sys.argv[1], outFileName))

result = {}
ways = doc["osm"]["way"]
nodes = doc["osm"]["node"]
relations = doc["osm"]["relation"]

node_dict = {}
#organize the nodes by id
for node in nodes:
    if type(node["tag"]) is list:
        elev = [kv["@v"] for kv in node["tag"] if kv["@k"] == "ele"][0]
    else:
        elev = node["tag"]["@v"]
    node_dict[node["@id"]] = {
        "x" : float(node["@lat"]),
        "y" : float(node["@lon"]),
        "z" : float(elev),
        "id": node["@id"]
    }

#organize the ways
for way in ways:
    #sanity check
    if not "tag" in way:
        print("No Tag found for way with id = ", way["@id"])
        continue
    
    tagDict = {}
    if not type(way["tag"])is list:
        tagList = [way["tag"]]
    else: tagList = way["tag"]
    
    for tagPair in tagList:
        key = tagPair["@k"]
        if key.split("_")[-1] == "type":
            key = "type"
        tagDict[key] = tagPair["@v"]
    if "highway" in tagDict or tagDict["type"] in omit:
        print("skip highway and boad_borders")
        continue

    #sanity check
    if "type" not in tagDict:
        print("Not type found for way with id = ", way["@id"])
        continue
    
    #Find the type Tag
    tagType = tagDict["type"]
    if not tagType in result:
        result[tagType] = []

    # create tag meta info
    tag_id = way["@id"] if not "original_id" in tagDict else tagDict["original_id"]
    tempWay = {
        "id" : tag_id,
        "type" : "line" if tagDict["type"] in ["solid_line", "dashed_line"] else tagDict["type"]
    }

    #Add nodes
    if tempWay["type"] == "line":
        tempWay["pts"] = []
        for nd in way["nd"]:
            node_id = nd["@ref"]
            tempWay["pts"].append(node_dict[node_id])
    else:
        tempWay["corners"] = []
        index_node = []
        for index in range (0, len(way["nd"])-1):
            nd = way["nd"][index]
            node_id = nd["@ref"]
            tempWay["corners"].append(node_dict[node_id])
            index_node.append(node_dict[node_id])
        
        if (tempWay["type"] == "parking_lot"):
            tempWay["epos"] = epos(index_node[0],index_node[3])
            tempWay["cpos"] = cpos(index_node[0],index_node[1],index_node[2],index_node[3])
    result[tagType].append(tempWay)

with open(outFileName, 'w') as fp:
    json.dump(result, fp)
