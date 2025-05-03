const PrintHeaderRow = () => {
  return (
    <tr>
      <td colSpan={3}>
        <div className="flex items-center px-6 py-4">
          <div className="grow flex flex-col">
            <div className="text-4xl font-medium">আহ্সান এন্টারপ্রাইজ</div>
            <div className="text-4xl font-semibold">AHSAN ENTERPRISE</div>
            <div className="text-xl font-semibold">IMPORT, EXPORT, INDENT, C&F</div>
            <div className="text-lg leading-6">Noor Mohal, Anandipur Gate, P.C. Road</div>
            <div className="text-lg leading-6">Halishahar, Chittagong</div>
          </div>
          <div className="flex-wrap flex flex-row space-x-4 leading-5">
            <div className="flex-wrap">
              Phone:<br/>Mobile:<br/><br/>Fax:<br/>E-Mail:
            </div>
            <div className="flex-wrap">
              031-2511325<br/>01711-748836<br/>01611-748836<br/>031-727038<br/>rafije@gmail.com
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default PrintHeaderRow