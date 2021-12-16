import { LightningElement,api,track } from 'lwc';

export default class Cb_mte_Toggle extends LightningElement {
    @api truename = '';
    @api falsename = '';
    @api label = '';
    @api helptext = '';
    @api value = false;

    renderedCallback() {
        let checkboxes = this.template.querySelector('[data-id="checkbox"]');
        if(this.value === 'true' || this.value === true){
            checkboxes.checked = true;
            this.value = true;
        }else{
            checkboxes.checked = false;
            this.value = false;
        }
    }
    
    handleChange(event) {
        this.value = !this.value;
        // Creates the event with the data.
        const selectedEvent = new CustomEvent("change", {detail: this.value});

        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }


}