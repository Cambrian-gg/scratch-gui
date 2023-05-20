import {costumeUpload} from '../../lib/file-uploader.js';

/**
 * Creates a costume based on the card.
 *
 * @return a promise that will resovle when the card is create. Resolve with the costume as param
 */
function createCardInCostumes(card, costumesTarget, scope) {
    const url = `${card.imageUrl}?time=${Date.now()}`;
    const storage = scope.props.vm.runtime.storage;
    const vm = scope.props.vm;
    // We need to return a promise to resolve after adding the costume
    // Otherwise we don't know when this addition will happen
    // We want the whole method to resolve then.
    return new Promise((resolve, reject)=> {
        fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.blob();
          }).then((blob) => {
            return new Promise((resolveFileReader, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = () => resolveFileReader(fileReader.result);
                fileReader.readAsDataURL(blob);
            });
          }).then((data)=> {
              costumeUpload(data,"image/png", storage, vmCostumes => {
                  vmCostumes.forEach((costume, i) => {
                      costume.name = `card-${card.id}-${card.name}`;
                  });
                  scope.addCostume(vmCostumes, costumesTarget.id, null).then(() => {
                      const costume = vmCostumes[0];
                      const index = costumesTarget.getCostumes().indexOf(costume)
                      const newIndex = scope.props.deck.cards.indexOf(card)
                      costumesTarget.reorderCostume(index, newIndex)
                      resolve(costume)
                  });
              },()=>{
                console.log("here")
              })
          }).catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
    })
}

export {
  createCardInCostumes
};