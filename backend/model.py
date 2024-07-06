from tortoise import fields, models

class Document(models.Model):
    id = fields.IntField(pk=True)
    type = fields.CharField(max_length=255)
    title = fields.CharField(max_length=255)
    position = fields.IntField(unique=True) #Document

def __str__(self):
        return self.title
