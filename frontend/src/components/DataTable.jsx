import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon } from "lucide-react"
import { motion } from "framer-motion"

const DataTable = ({ columns, data = [], title, showAdd, user }) => {
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const totalRows = data?.length || 0
  const totalPages = Math.ceil(totalRows / rowsPerPage)

  const handleRowsPerPageChange = (value) => {
    setRowsPerPage(Number(value))
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getPaginationInfo = () => {
    const start = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
    const end = Math.min(currentPage * rowsPerPage, totalRows)
    return `${start}-${end} of ${totalRows}`
  }

  const paginatedData = data?.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="container py-2 mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-none shadow-lg">
          <CardHeader className="flex flex-col space-y-3 bg-white border-b sm:space-y-0 sm:flex-row sm:items-center sm:justify-between dark:bg-gray-950">
            <CardTitle className="text-xl font-semibold">
              {title ? title.charAt(0).toUpperCase() + title.slice(1) + "s" : "Data"}
              <span className="ml-2 text-sm font-normal text-muted-foreground">({totalRows})</span>
            </CardTitle>
            
              <Button onClick={showAdd} className="w-full transition-colors bg-rose-600 hover:bg-rose-700 sm:w-auto">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add new {title}
              </Button>

          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-md">
              <motion.div variants={tableVariants} initial="hidden" animate="visible">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      {columns.map((column, index) => (
                        <TableHead key={index} className="font-medium">
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData && paginatedData.length > 0 ? (
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
  )
}

export default DataTable

