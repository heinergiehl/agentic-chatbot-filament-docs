<?php

namespace App\Support;

use App\Models\EarthquakeRecord;
use App\Models\Incident;
use App\Models\Rescuer;
use App\Models\RescueStation;

class IncidentManagementDataResources
{
    /**
     * @return array<string, array<string, mixed>>
     */
    public static function resources(): array
    {
        return [
            'incidents' => [
                'label' => 'Incidents',
                'description' => 'Live incident records from the operational incident system.',
                'query_guidance' => 'Use this for open incident status, category, severity, location, casualty count, and station assignment. Prefer status=open or status=monitoring for live manager answers.',
                'model' => Incident::class,
                'allowed_modes' => ['list', 'first'],
                'allowed_filters' => ['external_id', 'category', 'severity', 'status', 'station_id', 'location_name', 'occurred_at'],
                'allowed_selects' => ['id', 'external_id', 'category', 'severity', 'status', 'station_id', 'location_name', 'casualty_count', 'summary', 'occurred_at', 'updated_at'],
                'sortable_fields' => ['id', 'severity', 'status', 'occurred_at', 'updated_at'],
                'default_select' => ['external_id', 'category', 'severity', 'status', 'location_name', 'casualty_count', 'summary', 'occurred_at'],
                'default_sort' => ['column' => 'occurred_at', 'direction' => 'desc'],
                'default_limit' => 10,
                'max_limit' => 50,
            ],

            'rescue_stations' => [
                'label' => 'Rescue Stations',
                'description' => 'Station status, region, vehicle availability, and response capabilities.',
                'query_guidance' => 'Use this to identify nearby active stations and operational capacity. Do not expose raw coordinates unless needed for dispatch context.',
                'model' => RescueStation::class,
                'allowed_modes' => ['list', 'first'],
                'allowed_filters' => ['name', 'region', 'status'],
                'allowed_selects' => ['id', 'name', 'region', 'status', 'available_vehicles', 'capabilities', 'updated_at'],
                'sortable_fields' => ['id', 'name', 'region', 'available_vehicles', 'updated_at'],
                'default_select' => ['id', 'name', 'region', 'status', 'available_vehicles', 'capabilities'],
                'default_sort' => ['column' => 'name', 'direction' => 'asc'],
                'default_limit' => 10,
                'max_limit' => 50,
            ],

            'rescuers' => [
                'label' => 'Rescuers',
                'description' => 'Operational staff and rescuer availability.',
                'query_guidance' => 'Use this for availability and role matching. Avoid exposing phone numbers in public responses; keep this resource manager/dispatch only.',
                'model' => Rescuer::class,
                'allowed_modes' => ['list', 'first'],
                'allowed_filters' => ['station_id', 'role', 'status'],
                'allowed_selects' => ['id', 'station_id', 'name', 'role', 'status', 'certifications', 'shift_ends_at', 'updated_at'],
                'sortable_fields' => ['id', 'name', 'role', 'status', 'shift_ends_at'],
                'default_select' => ['id', 'station_id', 'name', 'role', 'status', 'certifications', 'shift_ends_at'],
                'default_sort' => ['column' => 'status', 'direction' => 'asc'],
                'default_limit' => 10,
                'max_limit' => 50,
            ],

            'earthquake_records' => [
                'label' => 'Earthquake Records',
                'description' => 'Historical and recent earthquake event records.',
                'query_guidance' => 'Use this for recent earthquake context, magnitude checks, and regional history. Combine with knowledge sources for procedures and after-action reports.',
                'model' => EarthquakeRecord::class,
                'allowed_modes' => ['list', 'first'],
                'allowed_filters' => ['external_id', 'region', 'magnitude', 'occurred_at'],
                'allowed_selects' => ['id', 'external_id', 'magnitude', 'region', 'depth_km', 'occurred_at'],
                'sortable_fields' => ['id', 'magnitude', 'occurred_at'],
                'default_select' => ['external_id', 'magnitude', 'region', 'depth_km', 'occurred_at'],
                'default_sort' => ['column' => 'occurred_at', 'direction' => 'desc'],
                'default_limit' => 10,
                'max_limit' => 100,
            ],
        ];
    }
}
