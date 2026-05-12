<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Incident extends Model
{
    protected $table = 'incident_demo_incidents';

    protected $fillable = [
        'station_id',
        'external_id',
        'category',
        'severity',
        'status',
        'location_name',
        'latitude',
        'longitude',
        'casualty_count',
        'summary',
        'occurred_at',
        'meta',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'casualty_count' => 'integer',
        'occurred_at' => 'datetime',
        'meta' => 'array',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(RescueStation::class, 'station_id');
    }
}
