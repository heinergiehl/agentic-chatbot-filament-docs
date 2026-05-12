<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EarthquakeRecord extends Model
{
    protected $table = 'incident_demo_earthquake_records';

    protected $fillable = [
        'external_id',
        'magnitude',
        'region',
        'latitude',
        'longitude',
        'depth_km',
        'occurred_at',
        'meta',
    ];

    protected $casts = [
        'magnitude' => 'float',
        'latitude' => 'float',
        'longitude' => 'float',
        'depth_km' => 'float',
        'occurred_at' => 'datetime',
        'meta' => 'array',
    ];
}
