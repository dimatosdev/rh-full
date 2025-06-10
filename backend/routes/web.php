<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DicomImageController;

Route::get('/', function () {
    return view('welcome');
});

// API Routes for DICOM Images
Route::prefix('api')->group(function () {
    Route::resource('dicom-images', DicomImageController::class);
    Route::get('dicom-images/{dicomImage}/download', [DicomImageController::class, 'download'])->name('dicom-images.download');
});
