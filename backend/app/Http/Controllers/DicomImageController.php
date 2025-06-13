<?php

namespace App\Http\Controllers;

use App\Models\DicomImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DicomImageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $images = DicomImage::all();
        return response()->json($images);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:512000',
                'name' => 'string|max:255'
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $file = $request->file('file');

            if (!$file || !$file->isValid()) {
                Log::error('Invalid file', [
                    'file_error' => $file ? $file->getErrorMessage() : 'No file received'
                ]);
                return response()->json(['error' => 'Arquivo inválido ou não recebido'], 422);
            }


            $filename = time() . '-' . $file->getClientOriginalName();
            $path = $file->storeAs('dicom_images', $filename, 'public');

            $dicomImage = DicomImage::create([
                'name' => $request->name ?: $file->getClientOriginalName(),
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType() ?: 'application/dicom'
            ]);

            Log::info('Upload successful', ['image_id' => $dicomImage->id]);

            return response()->json($dicomImage, 201);

        } catch (\Exception $e) {
            Log::error('Upload exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Erro interno do servidor: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(DicomImage $dicomImage)
    {
        return response()->json($dicomImage);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DicomImage $dicomImage)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $dicomImage->update($request->only(['name']));
        return response()->json($dicomImage);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DicomImage $dicomImage)
    {
        if (Storage::disk('public')->exists($dicomImage->file_path)) {
            Storage::disk('public')->delete($dicomImage->file_path);
        }

        $dicomImage->delete();
        return response()->json(['message' => 'Image deleted successfully']);
    }

    /**
     * Download image from storage.
     */
    public function download(DicomImage $dicomImage)
    {
        $filePath = storage_path('app/public/' . $dicomImage->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return response()->download($filePath, $dicomImage->original_name);
    }
}
