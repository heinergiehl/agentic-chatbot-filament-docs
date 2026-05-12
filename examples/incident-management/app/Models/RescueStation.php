<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RescueStation extends Model
{
    protected $table = 'incident_demo_rescue_stations';

    protected $fillable = [
        'name',
        'region',
        'status',
        'latitude',
        'longitude',
        'available_vehicles',
        'capabilities',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'available_vehicles' => 'integer',
        'capabilities' => 'array',
    ];

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class, 'station_id');
    }

    public function rescuers(): HasMany
    {
        return $this->hasMany(Rescuer::class, 'station_id');
    }
}
