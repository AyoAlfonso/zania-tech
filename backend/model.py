from tortoise import fields, models


# int, var , varchar, text, datetime, timestamp, decimal, float, boolean, primary_key, foreign_key, unique, index, check, enum, binary, date, time, json, null, raw

class Document(models.Model):
    id = fields.IntField(pk=True)
    type = fields.CharField(max_length=255)
    title = fields.CharField(max_length=255)
    position = fields.IntField(unique=True) #We need to make sure that the position is unique for each document

def __str__(self):
        return self.title
