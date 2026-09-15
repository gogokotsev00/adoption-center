import {Component, computed, OnInit, signal} from '@angular/core';
import {OwnersService} from "../service/owners.service";
import {Owner} from "../graphql/types";

@Component({
  selector: 'app-home',
  imports: [],
  template: `
      <div class="home-container">
          @if (!modeSelected()) {
              <div class="mode-select-container">
                  <select #modeTypeSelect (change)="selectModeType($any($event.target).value)">
                      <option value="" disabled selected>Select mode</option>
                      @for (mode of Object.values(ModeType); track mode) {
                          <option [value]="mode">{{ mode }}</option>
                      }
                  </select>
              </div>
          } @else {
              <div class="mode-action-container">
                  <div class="current-mode-title">Current mode: {{ modeType() }}</div>
                  <div class="mode-inputs">
                      @if (modeType() === ModeType.ADD_MODE) {
                          <input #addNameInput placeholder="Name" type="text" maxlength="35" pattern="[a-zA-Z\\s]+" required>
                          <input #addMoneyInput placeholder="0.00" type="number" step=".01" min="0" maxlength="6">
                          <button id="createOwnerBtn" (click)="createOwner(addNameInput.value, parseMoneyInput(addMoneyInput.value))">Create Owner</button>
                          <button class="clear-btn" (click)="clearAddMode(addNameInput, addMoneyInput)">Clear</button>
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
                          <button class="clear-btn" (click)="clearDeleteMode(deletionNameSelect)">Clear</button>
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
                          <button class="clear-btn" (click)="clearUpdateMode(updateMoneyNameSelect, updateMoneyInput)">Clear</button>
                      }
                      <button id="backButton" (click)="clearSelectedMode()">Back to mode selection</button>
                  </div>

                  <div class="result-message-container">
                      @if (validationError()) {
                          <span class="result-message validation-error">{{ validationError() }}</span>
                      } @else if (modeType() === ModeType.ADD_MODE && createdOwner() !== null) {
                          <span id="newOwnerResult" class="result-message">Created an owner with name: {{ createdOwner()?.name }} and ID: {{ createdOwner()?.id }}</span>
                      } @else if (modeType() === ModeType.DELETE_MODE && ownerDeleted() && deletedOwnerName()) {
                          <span id="deletedOwnerResult" class="result-message">Owner {{ deletedOwnerName() }} has been deleted!</span>
                      } @else if (modeType() === ModeType.UPDATE_MODE && updatedOwner() !== null) {
                          <span id="updatedOwnerMoneyResult" class="result-message">Owner {{ updatedOwner()?.name }} has new money stand: {{ updatedOwner()?.money }}$</span>
                      }
                  </div>
              </div>
          }

          @if (loading()) {
              <div class="status-message">Loading...</div>
          }
          @if (error()) {
              <div class="status-message error">
                  <p>Error :(</p>
                  <p>{{ error().message }}</p>
              </div>
          }

          <div class="table-container">
              <table class="owners-grid">
                  <thead>
                      <tr>
                          <th class="sortable" (click)="toggleSort('id')">
                              ID {{ sortColumn() === 'id' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                          </th>
                          <th class="sortable" (click)="toggleSort('name')">
                              Name {{ sortColumn() === 'name' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                          </th>
                          <th class="sortable" (click)="toggleSort('money')">
                              Money {{ sortColumn() === 'money' ? (sortDirection() === 'asc' ? '▲' : '▼') : '' }}
                          </th>
                      </tr>
                  </thead>
                  <tbody>
                      @for (owner of sortedOwners(); track owner.id) {
                          <tr>
                              <td>{{ owner.id }}</td>
                              <td>{{ owner.name }}</td>
                              <td>{{ Number(owner.money).toFixed(2) }}$</td>
                          </tr>
                      }
                  </tbody>
              </table>
          </div>
      </div>
  `,
  styleUrl: 'home.css'
})

export class Home implements OnInit {
    modeSelected = signal(false);
    modeType = signal<ModeType | ''>('');
    ownerDeleted = signal(false);
    deletedOwnerName = signal<string | null>(null);
    createdOwner = signal<Owner | null>(null);
    updatedOwner = signal<Owner | null>(null);
    validationError = signal<string | null>(null);

    sortColumn = signal<'id' | 'name' | 'money'>('id');
    sortDirection = signal<'asc' | 'desc'>('asc');

    owners = this.ownersService.owners;
    loading = this.ownersService.loading;
    error = this.ownersService.error;

    sortedOwners = computed(() => {
        const col = this.sortColumn();
        const dir = this.sortDirection();
        const factor = dir === 'asc' ? 1 : -1;
        return [...this.ownersService.owners()].sort((a, b) => {
            if (col === 'id') {
                return factor * (Number(a.id) - Number(b.id));
            } else if (col === 'money') {
                return factor * ((a.money ?? 0) - (b.money ?? 0));
            } else {
                return factor * (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' });
            }
        });
    });

    constructor(private ownersService: OwnersService ) {}

    ngOnInit() {
        this.ownersService.loadOwners();
    }

    toggleSort(col: 'id' | 'name' | 'money') {
        if (this.sortColumn() === col) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(col);
            this.sortDirection.set('asc');
        }
    }

    createOwner(name: string, money: number) {
        this.clearResults();
        const trimmedName = name ? name.trim() : '';
        if (trimmedName.length === 0) {
            this.validationError.set('Name cannot be empty!');
            return;
        }
        if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
            this.validationError.set('Name must contain only letters!');
            return;
        }
        if (isNaN(money) || money < 0) {
            this.validationError.set('Money must be non-negative!');
            return;
        }
        this.ownersService
            .createOwner(trimmedName, money)
            .subscribe(({ data }: any) => {
                this.createdOwner.set(data?.createOwner ?? null);
                this.ownersService.loadOwners();
            });
    }

    deleteOwner(id: string) {
        this.clearResults();
        const targetOwner = this.owners().find(o => String(o.id) === String(id));
        const ownerName = targetOwner?.name ?? '';
        this.ownersService
            .deleteOwner(id)
            .subscribe(() => {
                this.deletedOwnerName.set(ownerName);
                this.ownerDeleted.set(true);
                this.ownersService.loadOwners();
            });
    }

    updateOwnerMoney(id: string, money: number) {
        this.clearResults();
        this.ownersService
            .updateOwnerMoney(id, money)
            .subscribe(({ data }: any) => {
                this.updatedOwner.set(data?.updateOwnerMoney ?? null);
                this.ownersService.loadOwners();
            });
    }

    selectModeType(modeType: ModeType) {
        this.clearResults();
        this.modeType.set(modeType);
        this.modeSelected.set(true);
    }

    clearAddMode(nameInput: HTMLInputElement, moneyInput: HTMLInputElement) {
        nameInput.value = '';
        moneyInput.value = '';
        this.clearResults();
    }

    clearDeleteMode(ownerSelect: HTMLSelectElement) {
        ownerSelect.value = '';
        this.clearResults();
    }

    clearUpdateMode(ownerSelect: HTMLSelectElement, moneyInput: HTMLInputElement) {
        ownerSelect.value = '';
        moneyInput.value = '';
        this.clearResults();
    }

    clearResults() {
        this.createdOwner.set(null);
        this.ownerDeleted.set(false);
        this.deletedOwnerName.set(null);
        this.updatedOwner.set(null);
        this.validationError.set(null);
    }

    clearSelectedMode() {
        this.clearResults();
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
