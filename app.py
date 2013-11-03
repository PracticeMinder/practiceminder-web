
import os
import logging
import time
import json

FORMAT='[%(levelname)s] (%(pathname)s %(asctime)s): %(message)s'
logging.basicConfig(format=FORMAT)
log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

import bottle
from bottle import Bottle, redirect, request, abort, response, static_file
import pystache
from pymongo import MongoClient

import config
import utils

app = Bottle()


#
# Database setup methods
#

db = None

def __db__():
  global db
  if not db:
    connection = MongoClient(config.DB_SERVER, config.DB_PORT)
    db = connection[config.DB]
    db.authenticate(config.DB_USER,config.DB_PWD)

#
# Utility methods
#
def JSON(fun):
  def newfun(*args, **kwargs):
    response.content_type = "application/json"
    return fun(*args, **kwargs)
  return newfun



#
# JSON API
#

@app.route('/practices')
@JSON
def getPractices():
  """
  This gets the general practices data but excludes the metrics. This allows 
  an app to prefetch the info to display a useful tooltip while not querying 
  for the entire dataset.
  """
  return json.dumps(list(db.practices.find({}, {"metrics":0})))

@app.route('/practices/metrics')
@utils.cacheMemo(3600) # We cache the results for an hour.
@JSON
def getMetrics():
  """
  Returns all available metrics that can be queried using getMetric()

  There's probably a clever way to do this on Mongo's side, but this works ok
  """
  metrics = set([])
  
  for practice in db.practices.find():
    metrics = metrics.union( set(practice["metrics"].keys()) )

  return json.dumps({"available_metrics": list(metrics)})
  

@app.route('/practices/metric/<metric>')
@app.route('/practices/metric/<metric>/<limit>')
@JSON
def getMetric(metric, limit=500):
  """
  This gets a targeted metric for all practices
  """
  return json.dumps(list(db.practices.find(
    {
      "metrics.{}".format(metric): {"$exists":1},
    }, 
    {
      "metrics.{}".format(metric): 1,
    }
  ).limit(int(limit))))


#
# Routes
#

@app.route('/')
def index():
    return static_file("index.html", root=config.STATIC_PATH) 

@app.route("/<filepath:path>")
def serve_static(filepath):
  log.info("Serving static file")
  if os.access(os.path.join(config.STATIC_PATH, filepath), os.R_OK):
    # I can read the file OK
    return static_file(filepath,root=config.STATIC_PATH)
  else:
    abort(404, "Could not find resource specified")



if __name__ == "__main__":
  __db__()
  app.run(host='0.0.0.0', port=config.PORT, reloader=True, debug=True)
