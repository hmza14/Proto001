// frenchTableLabels.js
// Shared translations for MUI DataGrid components

const frenchTableLabels = {
    // Toolbar buttons
    toolbarColumns: "Colonnes",  
    toolbarFilters: "Filtres",
    toolbarDensity: "Densité",
    toolbarExport: "Exporter",
    toolbarColumnsLabel: "Afficher les colonnes",
    toolbarFiltersLabel: "Afficher les filtres",
    toolbarDensityLabel: "Taille des lignes",
    toolbarDensityCompact: "Compact",
    toolbarDensityStandard: "Standard",
    toolbarDensityComfortable: "Confortable",
    toolbarExportLabel: "Exporter",
    toolbarExportCSV: "Télécharger en CSV",
    toolbarExportPrint: "Imprimer",
  
    // Column menu
    columnMenuLabel: "Menu",
    columnMenuShowColumns: "Afficher les colonnes",
    columnMenuFilter: "Filtrer",
    columnMenuHideColumn: "Cacher",
    columnMenuUnsort: "Annuler le tri",
    columnMenuSortAsc: "Trier par ordre croissant",
    columnMenuSortDesc: "Trier par ordre décroissant",
  
    // Filters toolbar
    filterOperatorContains: "contient",
    filterOperatorEquals: "égal à",
    filterOperatorStartsWith: "commence par",
    filterOperatorEndsWith: "se termine par",
    filterOperatorIs: "est",
    filterOperatorNot: "n'est pas",
    filterOperatorAfter: "postérieur",
    filterOperatorOnOrAfter: "égal ou postérieur",
    filterOperatorBefore: "antérieur",
    filterOperatorOnOrBefore: "égal ou antérieur",
    filterOperatorIsEmpty: "est vide",
    filterOperatorIsNotEmpty: "n'est pas vide",
    filterOperatorIsAnyOf: "fait partie de",
  
    // Filter values text
    filterValueAny: "tous",
    filterValueTrue: "vrai",
    filterValueFalse: "faux",
  
    // Column header text
    columnHeaderFiltersTooltipActive: (count) =>
      count > 1 ? `${count} filtres actifs` : `${count} filtre actif`,
    columnHeaderFiltersLabel: "Afficher les filtres",
    columnHeaderSortLabel: "Trier",
  
    // Rows selected footer text
    footerRowSelected: (count) =>
      count > 1
        ? `${count.toLocaleString()} lignes sélectionnées`
        : `${count.toLocaleString()} ligne sélectionnée`,
  
    // Total rows footer text
    footerTotalRows: "Nombre total de lignes:",
  
    // Total visible rows footer text
    footerTotalVisibleRows: (visibleCount, totalCount) =>
      `${visibleCount.toLocaleString()} sur ${totalCount.toLocaleString()}`,
  
    // Checkbox selection text
    checkboxSelectionHeaderName: "Sélection",
    checkboxSelectionSelectAllRows: "Sélectionner toutes les lignes",
    checkboxSelectionUnselectAllRows: "Désélectionner toutes les lignes",
    checkboxSelectionSelectRow: "Sélectionner la ligne",
    checkboxSelectionUnselectRow: "Désélectionner la ligne",
  
    // Boolean cell text
    booleanCellTrueLabel: "vrai",
    booleanCellFalseLabel: "faux",
  
    // Quick filter
    toolbarQuickFilterPlaceholder: "Rechercher...",
    toolbarQuickFilterLabel: "Rechercher",
    toolbarQuickFilterDeleteIconLabel: "Effacer",
  
    // Column pinning text
    columnsPanelTextFieldLabel: "Trouver une colonne",
    columnsPanelTextFieldPlaceholder: "Titre de la colonne",
    columnsPanelDragIconLabel: "Réorganiser les colonnes",
    columnsPanelShowAllButton: "Tout afficher",
    columnsPanelHideAllButton: "Tout masquer",
  
    // Pagination
    MuiTablePagination: {
      labelRowsPerPage: "Lignes par page :",
      labelDisplayedRows: ({ from, to, count }) =>
        `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
    },
    footerRowsPerPage: "Lignes par page :",
    footerDisplayedRows: ({ from, to, count }) =>
      `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`,
    pagination: {
      labelRowsPerPage: "Lignes par page :",
      labelDisplayedRows: ({ from, to, count }) =>
        `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
    }
  };
  
  export default frenchTableLabels;