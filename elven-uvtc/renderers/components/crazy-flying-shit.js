function CrazyFlyingShitEffect(particleRadius,particleVelocity,maxParticleDecay,particleUpdateTime,count,color) {
    const particles = [];
    this.addParticle = spawnTime => {
        const horizontalVelocity = Math.random() > 0.5 ? particleVelocity : -particleVelocity;
        const verticalVelocity = Math.random() > 0.5 ? particleVelocity : -particleVelocity;
        const x = Math.random() * internalWidth;
        const y = Math.random() * internalHeight;
        particles.push({
            x: x,
            y: y,

            horizontalVelocity: horizontalVelocity,
            verticalVelocity: verticalVelocity,
            
            nextHorizontalVelocity: verticalVelocity,
            nextVerticalVelocity: horizontalVelocity,
            nextSizeDifference: maxParticleDecay / 2,

            spawnTime: spawnTime,
            size: 1.0
        });
    }
    this.addParticles = amount => {
        const spawnTime = performance.now();
        let i = 0;
        while(i < amount) {
            this.addParticle(spawnTime);
            i++;
        }
    }
    this.addParticles(count);

    let lastUpdate = 0;
    this.render = timestamp => {
        const timeDifference = timestamp - lastUpdate;
        const shouldUpdate = timeDifference >= particleUpdateTime;
        let i = 0;
        context.fillStyle = color;
        if(shouldUpdate) {
            lastUpdate = timestamp;
            while(i < particles.length) {
                const particle = particles[i];
                particle.size -= particle.nextSizeDifference;
                if(particle.size < 0) {
                    particles.splice(i,1);
                    this.addParticle(timestamp);
                } else {
                    particle.x += particle.nextHorizontalVelocity;
                    particle.y += particle.nextVerticalVelocity;
    
                    if(particle.x <= 0 || particle.x >= fullWidth) {
                        particle.horizontalVelocity = -particle.horizontalVelocity;
                    }
                    if(particle.y <= 0 || particle.y >= fullHeight) {
                        particle.verticalVelocity = -particle.verticalVelocity;
                    }

                    
                    particle.nextSizeDifference = maxParticleDecay * (Math.random() / particle.size);
                    particle.nextHorizontalVelocity = particle.horizontalVelocity * Math.random();
                    particle.nextVerticalVelocity = particle.verticalVelocity * Math.random();
    
                    context.beginPath();
                    context.arc(particle.x,particle.y,particleRadius*particle.size,0,PI2);
                    context.fill();
                }
                i++;
            }
        } else {
            const timeNormal = timeDifference / particleUpdateTime;

            while(i < particles.length) {

                const particle = particles[i];

                const approximatedSize = particle.size - (particle.nextSizeDifference * timeNormal);
                const approximatedX = particle.x + (particle.nextHorizontalVelocity * timeNormal);
                const approximateY = particle.y + (particle.nextVerticalVelocity * timeNormal);

                if(approximatedSize > 0) {
                    context.beginPath();
                    context.arc(approximatedX,approximateY,particleRadius*approximatedSize,0,PI2);
                    context.fill();
                }

                i++;
            }
        }
    }
}
export default CrazyFlyingShitEffect;
