<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DicomImageController;

Route::get('/', function () {
    return view('dicom.index');
});

Route::get('/dicom', function () {
    return view('dicom.index');
});

// API Routes
Route::prefix('api')->group(function () {
    Route::resource('dicom-images', DicomImageController::class);
    Route::get('dicom-images/{dicomImage}/download', [DicomImageController::class, 'download'])->name('dicom-images.download');
});
