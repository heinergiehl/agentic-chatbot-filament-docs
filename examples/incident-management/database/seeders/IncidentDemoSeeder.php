<?php

namespace Database\Seeders;

use App\Models\EarthquakeRecord;
use App\Models\Incident;
use App\Models\Rescuer;
use App\Models\RescueStation;
use Illuminate\Database\Seeder;

class IncidentDemoSeeder extends Seeder
{
    public function run(): void
    {
        $northStation = RescueStation::query()->create([
            'name' => 'North Ridge Rescue Station',
            'region' => 'north',
            'status' => 'active',
            'latitude' => 37.9845,
            'longitude' => 32.5182,
            'available_vehicles' => 4,
            'capabilities' => ['mountain_rescue', 'medical', 'drone_recon'],
        ]);

        $coastalStation = RescueStation::query()->create([
            'name' => 'Coastal Maritime Station',
            'region' => 'coast',
            'status' => 'active',
            'latitude' => 36.8121,
            'longitude' => 30.7056,
            'available_vehicles' => 2,
            'capabilities' => ['maritime_rescue', 'diving', 'medical'],
        ]);

        Rescuer::query()->insert([
            [
                'station_id' => $northStation->getKey(),
                'name' => 'Aylin Demir',
                'role' => 'field_commander',
                'status' => 'available',
                'phone' => '+90 555 0101',
                'certifications' => json_encode(['incident_command', 'medical']),
                'shift_ends_at' => now()->addHours(6),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => $northStation->getKey(),
                'name' => 'Murat Kaya',
                'role' => 'drone_operator',
                'status' => 'assigned',
                'phone' => '+90 555 0102',
                'certifications' => json_encode(['drone', 'mapping']),
                'shift_ends_at' => now()->addHours(4),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => $coastalStation->getKey(),
                'name' => 'Selin Arslan',
                'role' => 'maritime_rescuer',
                'status' => 'available',
                'phone' => '+90 555 0103',
                'certifications' => json_encode(['diving', 'medical']),
                'shift_ends_at' => now()->addHours(8),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        Incident::query()->create([
            'station_id' => $northStation->getKey(),
            'external_id' => 'INC-2026-0001',
            'category' => 'mountain',
            'severity' => 'high',
            'status' => 'open',
            'location_name' => 'North Ridge Trail Sector 4',
            'latitude' => 38.0123,
            'longitude' => 32.4421,
            'casualty_count' => 2,
            'summary' => 'Two hikers missing after severe weather. Drone team assigned and medical team on standby.',
            'occurred_at' => now()->subHours(3),
            'meta' => ['priority' => 'search_and_rescue', 'weather' => 'low visibility'],
        ]);

        Incident::query()->create([
            'station_id' => $coastalStation->getKey(),
            'external_id' => 'INC-2026-0002',
            'category' => 'maritime',
            'severity' => 'medium',
            'status' => 'monitoring',
            'location_name' => 'Eastern Marina Channel',
            'latitude' => 36.8011,
            'longitude' => 30.7458,
            'casualty_count' => 0,
            'summary' => 'Disabled small vessel reported drifting near marina channel. Patrol boat dispatched.',
            'occurred_at' => now()->subHours(1),
            'meta' => ['priority' => 'monitor', 'sea_state' => 'moderate'],
        ]);

        EarthquakeRecord::query()->create([
            'external_id' => 'EQ-2026-0422-A',
            'magnitude' => 4.8,
            'region' => 'north',
            'latitude' => 38.1011,
            'longitude' => 32.6102,
            'depth_km' => 7.5,
            'occurred_at' => now()->subDays(2),
            'meta' => ['source' => 'demo_feed', 'felt_reports' => 18],
        ]);
    }
}
