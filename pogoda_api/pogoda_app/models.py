from django.db import models

class Pogoda(models.Model):
    miasto = models.CharField(max_length=50, unique=True)
    szerokosc_geo = models.DecimalField(max_digits=9, decimal_places=6)
    dlugosc_geo = models.DecimalField(max_digits=9, decimal_places=6)
    temperatura = models.DecimalField(max_digits=4, decimal_places=1, null=True)
    czas = models.DateTimeField()

    def __str__(self):
        return self.miasto

    class Meta:
        db_table = 'pogoda'