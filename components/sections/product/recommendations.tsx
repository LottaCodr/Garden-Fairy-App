import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import React from 'react'

const Recommendations = () => {
    return (
        <section className="mt-24">
            <h2 className="mb-6 text-center text-2xl font-bold">You Might Also Like</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {["Fiddle Leaf Fig", "Snake Plant", "ZZ Plant", "Pothos"].map((p) => (
                    <Card key={p} className="group cursor-pointer">
                        <CardContent className="p-3">
                            <div className="overflow-hidden rounded-md">
                                <Image
                                    src={`/recommend-${p}.png`}
                                    alt={p}
                                    width={400}
                                    height={500}
                                    className="aspect-[4/5] object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                            <p className="mt-3 font-medium">{p}</p>
                            <p className="text-sm text-muted-foreground">₦12,000</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}

export default Recommendations

