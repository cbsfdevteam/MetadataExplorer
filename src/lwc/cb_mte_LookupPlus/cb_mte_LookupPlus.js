import { LightningElement, track,api } from 'lwc';

export default class Cb_mte_LookupPlus extends LightningElement {
    
    @track plabel='';
    @api placeholder='';
    @track pvalue='';
    @track _filterfieldapi='';
    @api listdata=[];
    @track Filteroptions= this.listdata;
    @track showSearchedValues = false;
    @api lookBasedOn = "";
    compareColumnNumber;

    
    @api
    get filterfieldapi() {
      return this._filterfieldapi;
    }
    set filterfieldapi(value) {
      this._filterfieldapi = value;
      this.compareColumnNumber = undefined;
    }

    searchHandleClick(event){
    }
    
    searchHandleKeyChange(event){ 
        this.plabel = event.target.value;
        if(this.plabel.length < 3){
            this.showSearchedValues = false;
        }else{
            this.showSearchedValues = true;
            this.searchfiltersubject();
        }
    }

    parentHandleAction(event){        
        this.showSearchedValues = false;
        this.plabel =  event.target.dataset.label;      
        this.pvalue =  event.target.dataset.value;      
        let data = {label:this.plabel , value: this.pvalue}
        const selectedEvent = new CustomEvent('selected', { detail: data });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);    
    }

    searchfiltersubject(){
        let wantedSubject = this.plabel;
        let data = this.listdata;
        if(this.compareColumnNumber == undefined){
            if(this._filterfieldapi != ""){
                let foundit = false;
                let compareColumnNumber = 0;
                data[0].fields.forEach((row) => {
                    if (row.name.toUpperCase().includes(this._filterfieldapi.toUpperCase())) {
                        this.compareColumnNumber = compareColumnNumber+2; // add 2 to skip label and api fields
                        foundit = true;
                        console.log('Found it!');
                    };
                    if(!foundit){
                        compareColumnNumber++;
                    }
                });
            }else{
                this.compareColumnNumber = 0; // default is Label
            }
        }
        if(wantedSubject != '' && this.compareColumnNumber != undefined){
            let currentData = [];
            console.log(this.compareColumnNumber);
            data.forEach((row) => {
                console.log(row.details[this.compareColumnNumber].toUpperCase());
                console.log(wantedSubject.toUpperCase());
                if (row.details[this.compareColumnNumber].toUpperCase().includes(wantedSubject.toUpperCase())) {
                    let compatibaleSubject = Object.assign({filterfield:row.details[this.compareColumnNumber]}, row);
                    console.log(JSON.stringify(compatibaleSubject));
                    currentData.push(compatibaleSubject);
                };
            });
            this.Filteroptions = currentData;
        }else{
            this.Filteroptions = data;
        }

    }

    speicalHandle(){
        if(this.plabel == ""){
            let data = {label:"" , value: ""}
            const selectedEvent = new CustomEvent('selected', { detail: data });
            // Dispatches the event.
            this.dispatchEvent(selectedEvent); 
        }
    }

}