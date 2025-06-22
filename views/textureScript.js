window.onload = async () => {
    await fetch('/textureList')
        .then(response => {
            if (!response.ok) {
                throw new Error('Netwerkfout: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Ontvangen textures:', data);

            const kastMaterialenContainer = document.querySelector('#kast-materialen .materialen');
            const keukenbladMaterialenContainer = document.querySelector('#keukenblad-materialen .materialen');

            data.forEach(texture => {
                // Maak de wrapper div aan
                const wrapper = document.createElement('div');
                wrapper.classList.add('materiaal-wrapper');

                // Maak de afbeelding aan
                const img = document.createElement('img');
                img.src = texture.url;
                img.alt = texture.name || 'Materiaal';
                img.classList.add('materiaal-img');
                img.id = `image-${texture.name}`

                const icon = document.createElement('img');
                icon.src = '/materiaalmannetje-wijst-removebg.png'; // vervang dit met het pad naar jouw icoon
                icon.classList.add('active-icon');

                // Voeg klik-handler toe
                img.addEventListener('click', (event) => handleTextureClick(texture, event, wrapper));

                // Voeg img toe aan wrapper
                wrapper.appendChild(img);
                wrapper.appendChild(icon);
                wrapper.id = `wrapper-${texture.name}`

                // Voeg wrapper toe aan de juiste container
                if (texture.cat === 'kast') {
                    kastMaterialenContainer.appendChild(wrapper);
                } else if (texture.cat === 'keukenblad') {
                    keukenbladMaterialenContainer.appendChild(wrapper);
                }
            });
        })
        .catch(error => {
            console.error('Fout bij ophalen van textureList:', error);
        });
};

const modelViewer = document.querySelector("#viewer")

// Deze functie wordt aangeroepen bij klikken op een texture-afbeelding
async function handleTextureClick(texture, event, wrapper) {
    console.log('Texture geklikt:', texture);
    console.log('Geklikt element:', event.currentTarget);

    const kastjes = modelViewer.model.materials[1]
    const keukenblad = modelViewer.model.materials[2]
    const text = await modelViewer.createTexture(texture.url)
    // Bepaal de juiste container (kast of keukenblad)

    let parentContainer;
    if (texture.cat === 'kast') {
        parentContainer = document.querySelector('#kast-materialen .materialen');
        kastjes.pbrMetallicRoughness.baseColorTexture.setTexture(text)
    } else if (texture.cat === 'keukenblad') {
        parentContainer = document.querySelector('#keukenblad-materialen .materialen');
        keukenblad.pbrMetallicRoughness.baseColorTexture.setTexture(text)
    }

    // Verwijder 'active' van alleen wrappers binnen deze container
    parentContainer.querySelectorAll('.materiaal-wrapper').forEach(el => el.classList.remove('active'));

    // Activeer de aangeklikte wrapper
    wrapper.classList.add('active');
}

let played = false;

document.getElementById('overlay-content').addEventListener('scroll', () => {
    if(!played) {
        document.getElementById('materiaalmannetje-video').play()
    }

    played = true;
})

const src = new EventSource('/textureUpdate');

src.onmessage = function(event) {
    console.log('button geklikt')
    const data = JSON.parse(event.data);
    console.log("SSE ontvangen:", data);

    const imgEl = document.getElementById(`image-${data.texture}`);
    const wrapperEl = document.getElementById(`wrapper-${data.texture}`);

    if (!imgEl || !wrapperEl) {
        console.warn("Wrapper of afbeelding niet gevonden voor texture:", data.texture);
        return;
    }

    handleTextureClick(
        { name: data.texture, url: `/textures/${data.texture}.jpg`, cat: data.cat },
        { currentTarget: imgEl },
        wrapperEl
    );
};


src.onerror = function(err) {
    console.error("Fout bij SSE:", err);
    src.close();
};

modelViewer.addEventListener("load", async () => {
    modelViewer.cameraOrbit = '0deg 80deg 9m'; 
    modelViewer.cameraTarget = '-1.9m 1m 0m'
    /*const material = modelViewer.model.materials[0]
    const texture = await modelViewer.createTexture('/textures/wood.jpg'
    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture)*/
});