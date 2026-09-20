import {Component, computed, OnInit, signal} from '@angular/core';
import {OwnersService} from "../service/owners.service";
import {Owner} from "../graphql/types";

@Component({
  selector: 'app-owners',
  imports: [],
  template: `
      <div class="owners-container">
          @if (!modeSelected()) {
              <div class="mode-select-container">
                  <select #modeTypeSelect id="modeTypeSelect" class="mode-select" (change)="selectModeType($any($event.target).value)">
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
                      @for (owner of paginatedOwners(); track owner.id) {
                          <tr>
                              <td>{{ owner.id }}</td>
                              <td>{{ owner.name }}</td>
                              <td>{{ Number(owner.money).toFixed(2) }}$</td>
                          </tr>
                      }
                  </tbody>
              </table>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination-bar owners-pagination">
              <div class="pagination-page-size">
                  <label for="ownerPageSizeSelect">Rows per page:</label>
                  <select id="ownerPageSizeSelect" [value]="pageSize()" (change)="setPageSize(Number($any($event.target).value))">
                      <option [value]="10">10</option>
                      <option [value]="25">25</option>
                      <option [value]="50">50</option>
                  </select>
              </div>

              <div class="pagination-info">
                  @if (totalItems() === 0) {
                      Showing 0 owners
                  } @else {
                      Showing {{ startItem() }}–{{ endItem() }} of {{ totalItems() }} owners
                  }
              </div>

              @if (totalPages() > 1) {
                  <div class="pagination-controls">
                      <button class="page-btn prev-btn" [disabled]="effectivePage() === 1" (click)="goToPage(effectivePage() - 1)">‹ Prev</button>
                      @for (p of totalPagesArray(); track $index) {
                          @if (p === '...') {
                              <span class="pagination-ellipsis">…</span>
                          } @else {
                              <button class="page-btn page-num-btn" [class.active]="p === effectivePage()" (click)="goToPage(+p)">{{ p }}</button>
                          }
                      }
                      <button class="page-btn next-btn" [disabled]="effectivePage() === totalPages()" (click)="goToPage(effectivePage() + 1)">Next ›</button>
                  </div>
              }
          </div>
      </div>
  `,
  styleUrl: './owners.css'
})

export class Owners implements OnInit {
    modeSelected = signal(false);
    modeType = signal<ModeType | ''>('');
    ownerDeleted = signal(false);
    deletedOwnerName = signal<string | null>(null);
    createdOwner = signal<Owner | null>(null);
    updatedOwner = signal<Owner | null>(null);
    validationError = signal<string | null>(null);

    sortColumn = signal<'id' | 'name' | 'money'>('id');
    sortDirection = signal<'asc' | 'desc'>('asc');

    pageSize = signal<number>(10);
    currentPage = signal<number>(1);

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

    totalPages = computed(() => {
        const count = this.sortedOwners().length;
        return Math.max(1, Math.ceil(count / this.pageSize()));
    });

    effectivePage = computed(() => {
        return Math.min(Math.max(1, this.currentPage()), this.totalPages());
    });

    paginatedOwners = computed(() => {
        const all = this.sortedOwners();
        const size = this.pageSize();
        const page = this.effectivePage();
        const start = (page - 1) * size;
        return all.slice(start, start + size);
    });

    totalItems = computed(() => this.sortedOwners().length);

    startItem = computed(() => {
        if (this.totalItems() === 0) return 0;
        return (this.effectivePage() - 1) * this.pageSize() + 1;
    });

    endItem = computed(() => {
        return Math.min(this.effectivePage() * this.pageSize(), this.totalItems());
    });

    totalPagesArray = computed(() => {
        const total = this.totalPages();
        const current = this.effectivePage();
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        const pages: (number | string)[] = [];
        const left = Math.max(2, current - 1);
        const right = Math.min(total - 1, current + 1);

        pages.push(1);
        if (left > 2) pages.push('...');
        for (let i = left; i <= right; i++) {
            pages.push(i);
        }
        if (right < total - 1) pages.push('...');
        pages.push(total);
        return pages;
    });

    constructor(private ownersService: OwnersService ) {}

    ngOnInit() {
        this.ownersService.loadOwners();
    }

    goToPage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    setPageSize(size: number) {
        this.pageSize.set(size);
        this.currentPage.set(1);
    }

    toggleSort(col: 'id' | 'name' | 'money') {
        if (this.sortColumn() === col) {
            this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
        } else {
            this.sortColumn.set(col);
            this.sortDirection.set('asc');
        }
        this.currentPage.set(1);
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
