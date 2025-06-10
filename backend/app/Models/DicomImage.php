<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DicomImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'file_path',
        'original_name',
        'file_size',
        'mime_type'
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];
}
