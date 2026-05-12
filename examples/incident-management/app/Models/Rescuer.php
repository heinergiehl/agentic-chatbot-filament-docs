<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rescuer extends Model
{
    protected $table = 'incident_demo_rescuers';

    protected $fillable = [
        'station_id',
        'name',
        'role',
        'status',
        'phone',
        'certifications',
        'shift_ends_at',
    ];

    protected $casts = [
        'certifications' => 'array',
        'shift_ends_at' => 'datetime',
    ];

    public function station(): BelongsTo
    {
        return $this->belongsTo(RescueStation::class, 'station_id');
    }
}
