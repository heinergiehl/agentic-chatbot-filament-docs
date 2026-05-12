<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_demo_rescue_stations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('region')->index();
            $table->string('status', 32)->default('active')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('available_vehicles')->default(0);
            $table->json('capabilities')->nullable();
            $table->timestamps();
        });

        Schema::create('incident_demo_rescuers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('station_id')->nullable()->constrained('incident_demo_rescue_stations')->nullOnDelete();
            $table->string('name');
            $table->string('role')->index();
            $table->string('status', 32)->default('available')->index();
            $table->string('phone')->nullable();
            $table->json('certifications')->nullable();
            $table->timestamp('shift_ends_at')->nullable();
            $table->timestamps();
        });

        Schema::create('incident_demo_incidents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('station_id')->nullable()->constrained('incident_demo_rescue_stations')->nullOnDelete();
            $table->string('external_id')->unique();
            $table->string('category')->index();
            $table->string('severity', 32)->index();
            $table->string('status', 32)->default('open')->index();
            $table->string('location_name');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('casualty_count')->default(0);
            $table->text('summary');
            $table->timestamp('occurred_at')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('incident_demo_earthquake_records', function (Blueprint $table): void {
            $table->id();
            $table->string('external_id')->unique();
            $table->decimal('magnitude', 4, 2)->index();
            $table->string('region')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('depth_km', 6, 2)->nullable();
            $table->timestamp('occurred_at')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_demo_earthquake_records');
        Schema::dropIfExists('incident_demo_incidents');
        Schema::dropIfExists('incident_demo_rescuers');
        Schema::dropIfExists('incident_demo_rescue_stations');
    }
};
