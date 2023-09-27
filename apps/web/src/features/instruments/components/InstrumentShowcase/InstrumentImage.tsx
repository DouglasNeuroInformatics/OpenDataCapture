import React from "react"

import { InstrumentKind } from "@open-data-capture/types"
import { HiPencilSquare } from "react-icons/hi2";

import handBrain from '@/assets/hand-brain.png';
import toolBrain from '@/assets/tool-brain.png';

export type InstrumentImageProps = {
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    kind: InstrumentKind | string
}

export const InstrumentImage = ({ kind }: InstrumentImageProps) => {

    switch(kind) {
        case 'form':
            return <img alt="tool brain" className="h-10 w-auto rounded-full"  src={toolBrain}/>
        case 'interactive':
            return <img alt="tool brain" className="h-10 w-auto rounded-full"  src={handBrain}/>
        default:
            return  <HiPencilSquare className="h-8 w-8" />
    }
}