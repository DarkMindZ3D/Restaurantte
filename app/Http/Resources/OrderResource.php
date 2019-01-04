<?php

namespace App\Http\Resources;

use App\Order;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'state' => Order::stateToStr($this->state),
            'item' => $this->item->name,
            'responsible_cook_id' => $this->responsible_cook_id ?? 0,
            'responsible_cook' => $this->responsibleCook()->value('name'),
            'start' => Carbon::parse($this->start)->format('d/m/Y \(H:m\)'),
            'end' => Carbon::parse($this->end)->format('d/m/Y \(H:m\)'),
            'created_at' => Carbon::parse($this->created_at)->format('d/m/Y \(H:m\)'),
            'updated_at' => Carbon::parse($this->updated_at)->format('d/m/Y \(H:m\)'),
        ];
    }
}
