import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  PlusIcon, Filter, ArrowUpDown, ChevronUp, ChevronDown, X, 
  ArrowDownAZ, ArrowDownZA, AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const DataTable = ({ 
  columns, 
  data = [], 
  title, 
  showAdd, 
  user,
  loading = false,
  onSort, // Function to handle sorting
  onFilter, // Function to handle filtering
  sortBy = null, // Current sort field
  sortDir = 'asc', // Current sort direction
  filters = {}, // Current filters
  filterOptions = {} // Available filter options
}) => {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalRows = data?.length || 0;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  // Reset to first page when data changes significantly
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, sortDir, JSON.stringify(filters)]);

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationInfo = () => {
    const start = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, totalRows);
    return `${start}-${end} of ${totalRows}`;
  };

  const paginatedData = data?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  
  // Handle sorting when a column is selected from the dropdown
  const handleSort = (field, direction) => {
    if (!onSort) return;
    onSort(field, direction);
  };
  
  // Handle filter changes
  const handleFilter = (filterName, value) => {
    if (!onFilter) return;
    onFilter(filterName, value);
  };
  
  // Clear all filters
  const clearFilters = () => {
    if (!onFilter) return;
    
    // Reset each filter to 'all'
    Object.keys(filters).forEach(key => {
      onFilter(key, 'all');
    });
  };
  
  // Check if any filters are applied
  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => value !== 'all');
  };
  
  // Count how many filters are active
  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };
  
  // Get the currently sorted column name for display
  const getSortedColumnLabel = () => {
    if (!sortBy) return "Select column";
    
    const column = columns.find(col => {
      const field = col.sortKey || col.key;
      return field === sortBy;
    });
    
    return column ? column.label : "Select column";
  };

  // Get the sort icon based on current direction
  const getSortIcon = () => {
    if (!sortBy) return <ArrowUpDown className="w-4 h-4" />;
    
    if (sortDir === 'asc') {
      return <ArrowDownAZ className="w-4 h-4" />;
    } else {
      return <ArrowDownZA className="w-4 h-4" />;
    }
  };

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  // Format filter option labels for display
  const getFilterOptionLabel = (option, filterKey) => {
    if (typeof option === 'object') {
      return option.name || option.label || option.programName || option.title || option.id || option.value || 'Unknown';
    }
    return option;
  };
  
  // Get a user-friendly display value for a filter
  const getFilterDisplayValue = (filterKey, value) => {
    if (value === 'all') return "All";
    
    if (filterOptions[filterKey]) {
      const option = filterOptions[filterKey].find(opt => 
        (typeof opt === 'object' ? 
          opt.id === value || opt.value === value : 
          opt === value)
      );
      
      if (option) {
        return typeof option === 'object' ? 
          getFilterOptionLabel(option, filterKey) : 
          option;
      }
    }
    
    return value;
  };

  return (
    <div className="container py-2 mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col space-y-3 bg-white border-b sm:space-y-0 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-950">
            <CardTitle className="text-xl font-semibold">
              {title ? title.charAt(0).toUpperCase() + title.slice(1) + "s" : "Data"}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({totalRows})</span>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              {onSort && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {getSortIcon()}
                      <span className="hidden ml-1 sm:inline">Sort: {getSortedColumnLabel()}</span>
                      <span className="ml-1 sm:hidden">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {columns
                        .filter(col => col.sortable)
                        .map(col => {
                          const field = col.sortKey || col.key;
                          const isCurrentSort = field === sortBy;
                          
                          return (
                            <DropdownMenuItem key={col.key} className="flex justify-between">
                              <span>{col.label}</span>
                              <div className="flex gap-2">
                                <Button
                                  variant={isCurrentSort && sortDir === 'asc' ? "default" : "ghost"}
                                  size="icon"
                                  className={`h-6 w-6 ${isCurrentSort && sortDir === 'asc' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSort(field, 'asc');
                                  }}
                                >
                                  <ArrowDownAZ className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={isCurrentSort && sortDir === 'desc' ? "default" : "ghost"}
                                  size="icon"
                                  className={`h-6 w-6 ${isCurrentSort && sortDir === 'desc' ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSort(field, 'desc');
                                  }}
                                >
                                  <ArrowDownZA className="w-4 h-4" />
                                </Button>
                              </div>
                            </DropdownMenuItem>
                          );
                        })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Filter Dropdown Menu */}
              {onFilter && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Filter</span>
                      {hasActiveFilters() && (
                        <Badge variant="secondary" className="ml-1">
                          {getActiveFilterCount()}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Filters</span>
                      {hasActiveFilters() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1 text-xs"
                          onClick={clearFilters}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clear all
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {/* No filters configured message */}
                    {Object.keys(filterOptions).length === 0 && (
                      <div className="flex items-center px-2 py-4 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        No filters available
                      </div>
                    )}
                    
                    {/* Filter options */}
                    {Object.entries(filterOptions).map(([filterKey, options]) => (
                      <DropdownMenuSub key={filterKey}>
                        <DropdownMenuSubTrigger>
                          <span className="flex items-center justify-between w-full">
                            <span>{filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getFilterDisplayValue(filterKey, filters[filterKey] || 'all')}
                            </span>
                          </span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="overflow-y-auto max-h-60">
                            <DropdownMenuItem 
                              className={filters[filterKey] === 'all' || !filters[filterKey] ? 'bg-muted' : ''}
                              onClick={() => handleFilter(filterKey, 'all')}
                            >
                              All {filterKey}s
                            </DropdownMenuItem>
                            
                            {Array.isArray(options) && options.map((option) => {
                              const optionValue = typeof option === 'object' ? 
                                option.id || option.value || option.programId : 
                                option;
                              
                              const isSelected = filters[filterKey] === optionValue;
                              
                              return (
                                <DropdownMenuItem 
                                  key={optionValue} 
                                  className={isSelected ? 'bg-muted' : ''}
                                  onClick={() => handleFilter(filterKey, optionValue)}
                                >
                                  {getFilterOptionLabel(option, filterKey)}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    ))}
                    
                    {/* Active filters */}
                    {hasActiveFilters() && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Active filters</DropdownMenuLabel>
                        {Object.entries(filters).map(([filterKey, value]) => {
                          if (value === 'all') return null;
                          
                          return (
                            <DropdownMenuItem key={`${filterKey}-${value}`} className="flex items-center justify-between">
                              <span>
                                <span className="font-medium">{filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}:</span>
                                {' '}
                                <span className="text-muted-foreground">
                                  {getFilterDisplayValue(filterKey, value)}
                                </span>
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFilter(filterKey, 'all');
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </DropdownMenuItem>
                          );
                        })}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Add Button */}
              {showAdd && (
                <Button onClick={showAdd} className="transition-colors bg-rose-600 hover:bg-rose-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add new {title}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-md">
              <motion.div variants={tableVariants} initial="hidden" animate="visible">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      {columns.map((column, index) => (
                        <TableHead 
                          key={index} 
                          className="font-medium"
                        >
                          <div className="flex items-center">
                            {column.label}
                            {onSort && column.sortable && sortBy === (column.sortKey || column.key) && (
                              sortDir === 'asc' 
                                ? <ChevronUp className="w-4 h-4 ml-1" /> 
                                : <ChevronDown className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 border-4 rounded-full border-t-rose-600 animate-spin"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedData && paginatedData.length > 0 ? (
                      paginatedData.map((row, rowIndex) => (
                        <motion.tr
                          key={rowIndex}
                          variants={rowVariants}
                          className="transition-colors border-b hover:bg-muted/50"
                        >
                          {columns.map((column, colIndex) => (
                            <TableCell key={`${rowIndex}-${colIndex}`} className="h-12 py-2">
                              {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </TableCell>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </div>

            <div className="flex flex-col p-4 space-y-4 border-t sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page:</span>
                <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                  <SelectTrigger className="h-8 w-[70px] border-0">
                    <SelectValue placeholder={rowsPerPage} />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">{getPaginationInfo()}</span>
              </div>

              <div className="flex items-center self-end max-sm:self-auto">
                <span className="mr-2 text-sm text-muted-foreground whitespace-nowrap">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-24 h-8 max-sm:w-8"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <PaginationPrevious className="w-4 h-4" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-24 h-8 max-sm:w-8"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <PaginationNext className="w-4 h-4" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DataTable;

