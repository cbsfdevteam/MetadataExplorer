import { LightningElement,track,api } from 'lwc';
import getMetadataFields from '@salesforce/apex/cb_metadataExplorer.getMetadataFields';

export default class Cb_mte_DropdownPicklist extends LightningElement {
    title =  "Select Fields To Show";
    @api metadatatype =  "";
    @api showallbutton =  false;
    placeholder = "0 Fields Selected";
    numberOfSelected = "";
    @track fields = [];
    @track selectedFields = [];
    loaded = true;
    async openClose(){
        
        if(this.fields.length === 0){
            this.loaded = false;
            await getMetadataFields({metadataApiName:this.metadatatype}).then((res)=>{
                 this.fields = res;
            })
            this.loaded = true;
        }
        let dropdown = this.template.querySelector(".slds-combobox");
        dropdown.classList.toggle("slds-is-open");
        if(!dropdown.classList.contains("slds-is-open")){
            this.shootEvent('selectedfields',this.selectedFields,this.metadatatype);
            document.removeEventListener("click", this.toggleDropdown);
        }else{
            document.addEventListener("click", this.toggleDropdown);

        }
    }

    async openCloseAll(){
        
            this.loaded = false;
            await getMetadataFields({metadataApiName:this.metadatatype}).then((res)=>{
                 this.fields = res;
                 this.selectedFields = [...res];
  
                 this.numberOfSelected = this.selectedFields.length+ " Fields Selected";

            })
            this.loaded = true;
        let dropdown = this.template.querySelector(".slds-combobox");
        dropdown.classList.remove("slds-is-open");
        if(!dropdown.classList.contains("slds-is-open")){
            this.shootEvent('selectedfields',this.selectedFields,this.metadatatype);
            document.removeEventListener("click", this.toggleDropdown);
        }
        let dropdowns = this.template.querySelectorAll(".slds-listbox__item");
         dropdowns.forEach(option => {
            option.style.backgroundColor = "lightblue";
         });
    }

    toggleDropdown = (evt) => {
        const target = this.template.querySelector('.cbpicklist');
        if (!evt.path.includes(target)){
            let dropdown = this.template.querySelector(".slds-combobox");
            dropdown.classList.toggle('slds-is-open');
            document.removeEventListener("click", this.toggleDropdown);
            evt.stopPropagation();
            this.shootEvent('selectedfields',this.selectedFields,this.metadatatype);

        }
    }

    selectField(event){
        if (this.selectedFields.some(e => e.name === event.currentTarget.dataset.name)) {
            let arry = this.selectedFields.find( ( e ) => e.name === event.currentTarget.dataset.name );
            var index = this.selectedFields.indexOf(arry);
            this.selectedFields.splice(index, 1);
            event.currentTarget.style.backgroundColor = "";
        }else{
            let arry = this.fields.find( ( e ) => e.name === event.currentTarget.dataset.name );
            this.selectedFields.push(arry);
            event.currentTarget.style.backgroundColor = "lightblue";
        }
        this.numberOfSelected = this.selectedFields.length+ " Fields Selected";
    }

    shootEvent(type,value,name){
        const selectedEvent = new CustomEvent(type, {
            detail : {name:name, value:value}
          });
        this.dispatchEvent(selectedEvent);
    }

}