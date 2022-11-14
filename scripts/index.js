db.instruments.aggregate([
  {
    "$lookup": {
      "from": "patients",
      "localField": "patientId",
      "foreignField": "sex",
      "as": "patientSex"
    }
  },
  {
    "$group": {
      "_id": {
          "$dateToString": {
            "date": {
                  "$toDate": "$createdAt"
              },
            "format": "%Y-%m-%d"
          }
      },
      "meanScore": {
        "$avg": "$score"
      } 
    }
  }
])

db.instruments.aggregate([
  {
    "$lookup": {
      "from": "patients",
      "localField": "patientId",
      "foreignField": "_id",
      "as": "patient"
    }
  },
  {
    "$unwind": "$patient"
  },
  {
    "$addFields": {
      "sex": "$patient.sex",
    }
  }
])