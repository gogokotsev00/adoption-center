import {Component, OnInit, signal} from '@angular/core';
import {OwnersService} from "../service/owners.service";
import {Owner} from "../graphql/types";

@Component({
  selector: 'app-home',
  imports: [],
  template: `
      @if (!modeSelected()) {
          <select #modeTypeSelect (change)="selectModeType($any($event.target).value)">
              <option value="" disabled selected>Select mode</option>
              @for (mode of Object.values(ModeType); track modeType) {
                  <option [value]="mode">{{ mode }}</option>
              }
          </select>
      } @else {
          @if (modeType() === ModeType.ADD_MODE) {
              <input #addNameInput placeholder="Name" type="text" maxlength="35">
              <input #addMoneyInput placeholder="0.00" type="number" step=".01" maxlength="6">
              <button id="createOwnerBtn" (click)="createOwner(addNameInput.value, parseMoneyInput(addMoneyInput.value))">Create Owner</button>
              <span id="newOwnerResult" [hidden]="createdOwner() === null">Created an owner with name: {{ createdOwner()?.name }} and ID: {{ createdOwner()?.id }}</span>
          } @else if (modeType() === ModeType.DELETE_MODE) {
              <select #deletionNameSelect>
                  <option value="" disabled selected>Select owner</option>
                  @if (owners() && owners().length > 0) {
                      @for (owner of owners(); track owner.id) {
                          <option value="{{ owner.id }}">{{ owner.name }}</option>
                      }
                  }
              </select>
              <button id="deleteOwnerBtn" (click)="deleteOwner(deletionNameSelect.value)">Delete Owner</button>
              <span id="deletedOwnerResult" [hidden]="!ownerDeleted()">Owner has been deleted!</span>
          } @else {
              <select #updateMoneyNameSelect>
                  <option value="" disabled selected>Select owner</option>
                  @if (owners() && owners().length > 0) {
                      @for (owner of owners(); track owner.id) {
                          <option value="{{ owner.id }}">{{ owner.name }}</option>
                      }
                  }
              </select>
              <input #updateMoneyInput placeholder="0.00" type="number" step=".01" maxlength="6">
              <button id="updateMoneyButton" (click)="updateOwnerMoney(updateMoneyNameSelect.value, parseMoneyInput(updateMoneyInput.value))">Update Owner's Money</button>
              <span id="updatedOwnerMoneyResult" [hidden]="updatedOwner() === null">Owner {{ updatedOwner()?.name }} has new money stand: {{ updatedOwner()?.money }}$</span>
          }
          <button id="backButton" (click)="clearSelectedMode()">Back to mode selection</button>
      }

      @if (loading()) {
          <div>Loading...</div>
      }
      @if (error()) {
          <div>Error :(</div>
          <p>{{ error().message }}</p>
      }
      <table>
          <thead>
              <td>ID</td>
              <td>Name</td>
              <td>Money</td>
          </thead>
          @for (owner of owners(); track owner.id) {
              <tr>
                  <td>{{ owner.id }}</td>
                  <td>{{ owner.name }}</td>
                  <td>{{ Number(owner.money).toFixed(2) }}$</td>
              </tr>
          }
      </table>
  `,
  styleUrl: 'home.css'
})

export class Home implements OnInit {
    modeSelected = signal(false);
    modeType = signal<ModeType | ''>('');
    ownerDeleted = signal(false);
    createdOwner = signal<Owner | null>(null);
    updatedOwner = signal<Owner | null>(null);

    owners = this.ownersService.owners;
    loading = this.ownersService.loading;
    error = this.ownersService.error;

    constructor(private ownersService: OwnersService ) {}

    ngOnInit() {
        this.ownersService.loadOwners();
    }

    createOwner(name: string, money: number) {
        this.ownersService
            .createOwner(name, money)
            .subscribe(({ data }: any) =>
                this.createdOwner.set(data?.createOwner ?? null)
            );
        this.ownersService.loadOwners();
    }

    deleteOwner(id: string) {
        this.ownersService
            .deleteOwner(id)
            .subscribe(() => this.ownerDeleted.set(true));
        this.ownersService.loadOwners();
    }

    updateOwnerMoney(id: string, money: number) {
        this.ownersService
            .updateOwnerMoney(id, money)
            .subscribe(({ data }: any) =>
                this.updatedOwner.set(data?.updateOwnerMoney ?? null)
            );
        this.ownersService.loadOwners();
    }

    selectModeType(modeType: ModeType) {
        this.modeType.set(modeType);
        this.modeSelected.set(true);
    }

    clearSelectedMode() {
        this.modeType.set("");
        this.modeSelected.set(false);
    }

    parseMoneyInput(money: string) {
        return +Number(money).toFixed(2);
    }

    protected readonly Number = Number;
    protected readonly ModeType = ModeType;
    protected readonly Object = Object;
}

const ModeType = {
    ADD_MODE: 'ADD',
    DELETE_MODE: 'DELETE',
    UPDATE_MODE: 'UPDATE',
};

type ModeType = typeof ModeType[keyof typeof ModeType];
